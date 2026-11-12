import type { Payload } from 'payload'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import type { User } from '@/payload-types'

import {
  adminUser,
  closePayload,
  courseData,
  getTestPayload,
  uploadImage,
  wipeCollections,
} from './helpers'

let payload: Payload
let admin: User & { collection: 'users' }
let heroImage: number

beforeAll(async () => {
  payload = await getTestPayload()
  await wipeCollections(payload)
  admin = await adminUser(payload)
  heroImage = await uploadImage(payload, 700, 900)

  await payload.create({
    collection: 'courses',
    data: { ...courseData('access-live', heroImage), _status: 'published' },
    overrideAccess: true,
    context: { disableRevalidate: true },
  })
  await payload.create({
    collection: 'courses',
    data: { ...courseData('access-draft', heroImage), _status: 'draft' },
    draft: true,
    overrideAccess: true,
    context: { disableRevalidate: true },
  })
})

afterAll(async () => {
  await closePayload(payload)
})

describe('anonymous visitors', () => {
  it('read published courses only', async () => {
    const result = await payload.find({
      collection: 'courses',
      overrideAccess: false,
      draft: false,
    })
    expect(result.docs.map((doc) => doc.slug)).toEqual(['access-live'])
  })

  it('cannot read drafts even when asking for them', async () => {
    const result = await payload.find({ collection: 'courses', overrideAccess: false, draft: true })
    expect(result.docs.map((doc) => doc.slug)).not.toContain('access-draft')
  })

  it('cannot write content', async () => {
    await expect(
      payload.create({
        collection: 'courses',
        data: courseData('access-anon', heroImage),
        overrideAccess: false,
      }),
    ).rejects.toMatchObject({ status: 403 })
    await expect(
      payload.create({
        collection: 'reviews',
        data: { author: 'Anonym', text: 'Spam' },
        overrideAccess: false,
      }),
    ).rejects.toMatchObject({ status: 403 })
  })

  it('cannot see users or redirects but can see media', async () => {
    await expect(
      payload.find({ collection: 'users', overrideAccess: false }),
    ).rejects.toMatchObject({ status: 403 })
    await expect(
      payload.find({ collection: 'redirects', overrideAccess: false }),
    ).rejects.toMatchObject({ status: 403 })
    const media = await payload.find({ collection: 'media', overrideAccess: false })
    expect(media.totalDocs).toBeGreaterThan(0)
  })

  it('cannot update globals', async () => {
    await expect(
      payload.updateGlobal({
        slug: 'technical-settings',
        data: { noindex: false },
        overrideAccess: false,
      }),
    ).rejects.toMatchObject({ status: 403 })
  })
})

describe('logged-in admins', () => {
  it('see drafts and published documents', async () => {
    const result = await payload.find({
      collection: 'courses',
      overrideAccess: false,
      user: admin,
      draft: true,
    })
    expect(result.docs.map((doc) => doc.slug).sort()).toEqual(['access-draft', 'access-live'])
  })

  it('can create, update and delete content', async () => {
    const review = await payload.create({
      collection: 'reviews',
      data: { author: 'Int', text: 'Sehr gut.', _status: 'published' },
      overrideAccess: false,
      user: admin,
      context: { disableRevalidate: true },
    })
    const updated = await payload.update({
      collection: 'reviews',
      id: review.id,
      data: { text: 'Sehr, sehr gut.' },
      overrideAccess: false,
      user: admin,
      context: { disableRevalidate: true },
    })
    expect(updated.text).toBe('Sehr, sehr gut.')
    await payload.delete({
      collection: 'reviews',
      id: review.id,
      overrideAccess: false,
      user: admin,
      context: { disableRevalidate: true },
    })
  })

  it('can read users and redirects', async () => {
    const users = await payload.find({ collection: 'users', overrideAccess: false, user: admin })
    expect(users.totalDocs).toBe(1)
    await expect(
      payload.find({ collection: 'redirects', overrideAccess: false, user: admin }),
    ).resolves.toBeDefined()
  })
})

describe('locked fields and guards', () => {
  it('keeps the course slug after creation', async () => {
    const course = await payload.find({
      collection: 'courses',
      where: { slug: { equals: 'access-live' } },
      overrideAccess: true,
    })
    const updated = await payload.update({
      collection: 'courses',
      id: course.docs[0]!.id,
      data: { slug: 'renamed' },
      overrideAccess: false,
      user: admin,
      context: { disableRevalidate: true },
    })
    expect(updated.slug).toBe('access-live')
  })

  it('generates the slug from the German title', async () => {
    const course = await payload.create({
      collection: 'courses',
      data: { ...courseData('ignored', heroImage), slug: '', title: 'Yoga für Rücken' },
      overrideAccess: false,
      user: admin,
      context: { disableRevalidate: true },
    })
    expect(course.slug).toBe('yoga-fuer-ruecken')
  })

  it('never deletes the last admin user', async () => {
    await expect(
      payload.delete({ collection: 'users', id: admin.id, overrideAccess: false, user: admin }),
    ).rejects.toThrow(/letzte Benutzer/)
  })
})
