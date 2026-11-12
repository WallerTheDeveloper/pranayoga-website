import path from 'node:path'

import config from '@payload-config'
import { getPayload } from 'payload'

import { COPY_MEDIA, COPY_MEDIA_KEYS } from '@/content/copy/mediaRefs'

import { clearDataCache } from '../scripts/clear-data-cache.mjs'

import { seedTechnicalDefaults } from './data/settings'
import { assertImagesListed, loadManifest } from './manifest'
import { seedAdmin } from './steps/admin'
import {
  referencedCourseImages,
  seedCourseDocs,
  seedPriceGroupDocs,
  seedRedirectDocs,
  seedReviewDocs,
} from './steps/content'
import { seedMedia } from './steps/media'
import { seedGlobals } from './steps/settings'

/**
 * Loads the design copy and images into Payload. Every step upserts, so it can run again, but a
 * re-run resets seeded content to the design copy and publishes it: edits made in the admin
 * are overwritten. seed/guard.ts keeps it away from non-local databases.
 */
export async function runSeed(projectDir: string): Promise<void> {
  const seedDir = path.join(projectDir, 'seed')
  const imagesDir = path.join(seedDir, 'images')
  const manifest = loadManifest(path.join(seedDir, 'manifest.json'), imagesDir)
  assertImagesListed(manifest, [
    ...referencedCourseImages(),
    ...COPY_MEDIA_KEYS.map((key) => COPY_MEDIA[key].filename),
    seedTechnicalDefaults.defaultSeoImage,
  ])

  const payload = await getPayload({ config })
  try {
    const mediaIds = await seedMedia(payload, manifest.images, imagesDir)
    const ctx = { payload, mediaIds }
    const courseIds = await seedCourseDocs(ctx)
    await seedPriceGroupDocs(ctx, courseIds)
    await seedReviewDocs(ctx)
    await seedGlobals(ctx)
    await seedRedirectDocs(ctx, courseIds)
    await seedAdmin(payload)
    // The seed skips revalidation, so cached pages would keep the old content.
    clearDataCache(projectDir)
    payload.logger.info(
      'Seed complete. Restart a running dev or start server to drop its in-memory cache.',
    )
  } finally {
    await payload.destroy()
  }
}
