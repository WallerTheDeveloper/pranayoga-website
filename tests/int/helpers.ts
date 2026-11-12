import { rmSync } from 'node:fs'

import config from '@payload-config'
import { getPayload, type CollectionSlug, type Payload } from 'payload'
import sharp from 'sharp'

import type { User } from '@/payload-types'

import { assertTestDatabase, isTestUploadFolder } from '../setup/testDatabase'

/** Shared helpers for the integration suites. Every write uses the test database only. */

export function getTestPayload(): Promise<Payload> {
  return getPayload({ config })
}

export async function closePayload(payload: Payload): Promise<void> {
  await payload.destroy()
  ;(globalThis as { _payload?: Map<string, unknown> })._payload?.clear()
}

/** Collections the suites write to, children before what they reference. */
const WIPE_ORDER: readonly CollectionSlug[] = [
  'redirects',
  'courses',
  'price-groups',
  'reviews',
  'media',
  'users',
]

const VERSIONED: readonly CollectionSlug[] = ['courses', 'price-groups', 'reviews']

/**
 * Empties the test collections without running hooks (the media delete guard and the last-user
 * guard would refuse), and the test upload folder, so uploads keep their names on the next run.
 * Both guards run before anything is deleted.
 */
export async function wipeCollections(payload: Payload): Promise<void> {
  assertTestDatabase()
  const staticDir = payload.collections.media.config.upload.staticDir
  if (!isTestUploadFolder(staticDir)) {
    throw new Error(
      `Refusing to empty "${staticDir}": set MEDIA_DIR=uploads/test-media in .env.test.`,
    )
  }
  for (const collection of WIPE_ORDER) {
    await payload.db.deleteMany({ collection, where: { id: { exists: true } } })
  }
  for (const collection of VERSIONED) {
    await payload.db.deleteVersions({ collection, where: { id: { exists: true } } })
  }
  rmSync(staticDir, { recursive: true, force: true })
}

export const ADMIN_EMAIL = 'int-admin@example.test'
export const ADMIN_PASSWORD = 'int-admin-password-1'

/** Creates (or returns) the suite's admin user, ready to pass as `user` to the Local API. */
export async function adminUser(payload: Payload): Promise<User & { collection: 'users' }> {
  const existing = await payload.find({
    collection: 'users',
    where: { email: { equals: ADMIN_EMAIL } },
    overrideAccess: true,
    limit: 1,
  })
  const user =
    existing.docs[0] ??
    (await payload.create({
      collection: 'users',
      data: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD },
      overrideAccess: true,
    }))
  return { ...user, collection: 'users' }
}

/** A generated JPEG of the given size, as an upload file. */
export async function jpegFile(width: number, height: number, name = `int-${width}x${height}.jpg`) {
  const data = await sharp({
    create: { width, height, channels: 3, background: { r: 200, g: 180, b: 160 } },
  })
    .jpeg()
    .toBuffer()
  return { data, mimetype: 'image/jpeg', name, size: data.length }
}

/** Uploads a generated image and returns its id. */
export async function uploadImage(
  payload: Payload,
  width: number,
  height: number,
  name?: string,
): Promise<number> {
  const doc = await payload.create({
    collection: 'media',
    data: { alt: `Testbild ${width}×${height}` },
    file: await jpegFile(width, height, name),
    overrideAccess: true,
    context: { disableRevalidate: true },
  })
  return doc.id
}

/** Minimal valid course data; image ids must be uploaded first. */
export function courseData(
  slug: string,
  heroImage: number,
  overrides: Record<string, unknown> = {},
) {
  return {
    title: `Int ${slug}`,
    slug,
    icon: 'hatha' as const,
    tagline: 'Für Tests',
    cardTeaser: 'Ein Kurs für Integrationstests.',
    hero: { lead: 'Ein Testkurs.', image: heroImage },
    steps: { heading: 'Ablauf', items: [] },
    benefits: { heading: 'Wirkung', items: [] },
    ...overrides,
  }
}
