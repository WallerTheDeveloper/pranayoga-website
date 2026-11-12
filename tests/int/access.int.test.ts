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

describe('teacher training global', () => {
  it('anonymous visitors read the published version, never the draft', async () => {
    const system = { overrideAccess: true, context: { disableRevalidate: true } } as const
    await payload.updateGlobal({
      slug: 'teacher-training',
      data: { teaser: { heading: 'Öffentlich' }, _status: 'published' },
      draft: false,
      ...system,
    })
    await payload.updateGlobal({
      slug: 'teacher-training',
      data: { teaser: { heading: 'Geheimer Entwurf' } },
      draft: true,
      ...system,
    })
    for (const draft of [false, true]) {
      const doc = await payload.findGlobal({
        slug: 'teacher-training',
        draft,
        overrideAccess: false,
      })
      expect(doc.teaser?.heading).toBe('Öffentlich')
    }
    const asAdmin = await payload.findGlobal({ slug: 'teacher-training', draft: true, user: admin })
    expect(asAdmin.teaser.heading).toBe('Geheimer Entwurf')
  })

  it('anonymous visitors cannot update it', async () => {
    await expect(
      payload.updateGlobal({
        slug: 'teacher-training',
        data: { price: 1 },
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

  it('publishes a course whose first autosave had no title yet (the admin flow)', async () => {
    const asAdmin = { overrideAccess: false, user: admin, context: { disableRevalidate: true } }
    // Opening "new course" autosaves an empty draft; every later save is an update.
    const draft = await payload.create({
      collection: 'courses',
      data: {},
      draft: true,
      ...asAdmin,
    })
    expect(draft.slug ?? null).toBeNull()

    const typed = await payload.update({
      collection: 'courses',
      id: draft.id,
      data: { title: 'Yin Yo' },
      draft: true,
      autosave: true,
      ...asAdmin,
    })
    expect(typed.slug).toBe('yin-yo')

    const { slug: _ignored, ...rest } = courseData('ignored', heroImage)
    const published = await payload.update({
      collection: 'courses',
      id: draft.id,
      data: { ...rest, title: 'Yin Yoga für Anfänger', _status: 'published' },
      ...asAdmin,
    })
    expect(published.slug).toBe('yin-yoga-fuer-anfaenger')
  })

  it('a second untitled draft does not clash with the first', async () => {
    const asAdmin = { overrideAccess: false, user: admin, context: { disableRevalidate: true } }
    const first = await payload.create({ collection: 'courses', data: {}, draft: true, ...asAdmin })
    const second = await payload.create({
      collection: 'courses',
      data: {},
      draft: true,
      ...asAdmin,
    })
    expect(second.id).not.toBe(first.id)
  })

  it('keeps the slug once a course was published, also after unpublishing', async () => {
    const asAdmin = { overrideAccess: false, user: admin, context: { disableRevalidate: true } }
    const live = await payload.create({
      collection: 'courses',
      data: { ...courseData('slug-once-live', heroImage), _status: 'published' },
      ...asAdmin,
    })
    const unpublished = await payload.update({
      collection: 'courses',
      id: live.id,
      data: { _status: 'draft' },
      ...asAdmin,
    })
    const renamed = await payload.update({
      collection: 'courses',
      id: unpublished.id,
      data: { title: 'Ganz anderer Titel' },
      draft: true,
      ...asAdmin,
    })
    expect(renamed.slug).toBe('slug-once-live')
  })

  it('duplicating a published course gives the copy its own slug from the new title', async () => {
    const asAdmin = { overrideAccess: false, user: admin, context: { disableRevalidate: true } }
    const original = await payload.create({
      collection: 'courses',
      data: { ...courseData('slug-original', heroImage), _status: 'published' },
      ...asAdmin,
    })
    const copy = await payload.duplicate({
      collection: 'courses',
      id: original.id,
      draft: true,
      ...asAdmin,
    })
    expect(copy.id).not.toBe(original.id)
    expect(copy.slug).not.toBe('slug-original')

    const renamed = await payload.update({
      collection: 'courses',
      id: copy.id,
      data: { title: 'Abendkurs am Mittwoch' },
      draft: true,
      ...asAdmin,
    })
    expect(renamed.slug).toBe('abendkurs-am-mittwoch')
  })

  it('lets a maintenance script rename a published slug on purpose', async () => {
    const live = await payload.create({
      collection: 'courses',
      data: { ...courseData('slug-before-move', heroImage), _status: 'published' },
      overrideAccess: true,
      context: { disableRevalidate: true },
    })
    const moved = await payload.update({
      collection: 'courses',
      id: live.id,
      data: { slug: 'Slug nach Umzug' },
      overrideAccess: true,
      context: { disableRevalidate: true, allowSlugChange: true },
    })
    expect(moved.slug).toBe('slug-nach-umzug')
  })

  it('never deletes the last admin user', async () => {
    await expect(
      payload.delete({ collection: 'users', id: admin.id, overrideAccess: false, user: admin }),
    ).rejects.toThrow(/letzte Benutzer/)
  })
})
