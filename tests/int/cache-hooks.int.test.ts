import { revalidateTag } from 'next/cache'
import type { Payload } from 'payload'
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import type { User } from '@/payload-types'

import {
  adminUser,
  closePayload,
  courseData,
  getTestPayload,
  uploadImage,
  wipeCollections,
} from './helpers'

/**
 * Which admin action clears which cache tags, through the real hooks and database. A tag is
 * "cleared" when the hook calls revalidateTag (mocked in tests/setup/int.ts).
 */

let payload: Payload
let admin: User & { collection: 'users' }
let heroImage: number

const expired = () => vi.mocked(revalidateTag).mock.calls.map(([tag]) => tag)

beforeAll(async () => {
  payload = await getTestPayload()
  await wipeCollections(payload)
  admin = await adminUser(payload)
  heroImage = await uploadImage(payload, 700, 900)
})

afterAll(async () => {
  await closePayload(payload)
})

beforeEach(() => {
  vi.mocked(revalidateTag).mockClear()
})

describe('courses', () => {
  let id: number

  it('publishing clears the list and the course page', async () => {
    const course = await payload.create({
      collection: 'courses',
      data: { ...courseData('cache-a', heroImage), _status: 'published' },
      user: admin,
    })
    id = course.id
    expect(expired()).toEqual(['courses', 'course:cache-a'])
  })

  it('a draft or autosave on top of the published version clears nothing', async () => {
    await payload.update({
      collection: 'courses',
      id,
      data: { tagline: 'Entwurf' },
      draft: true,
      user: admin,
    })
    await payload.update({
      collection: 'courses',
      id,
      data: { tagline: 'Autosave' },
      draft: true,
      autosave: true,
      user: admin,
    })
    expect(expired()).toEqual([])
  })

  it('publishing the draft clears again', async () => {
    await payload.update({
      collection: 'courses',
      id,
      data: { tagline: 'Live', _status: 'published' },
      user: admin,
    })
    expect(expired()).toEqual(['courses', 'course:cache-a'])
  })

  it('unpublishing clears', async () => {
    await payload.update({ collection: 'courses', id, data: { _status: 'draft' }, user: admin })
    expect(expired()).toEqual(['courses', 'course:cache-a'])
  })

  it('deleting a draft-only course clears nothing, deleting a published one does', async () => {
    await payload.delete({ collection: 'courses', id, user: admin })
    expect(expired()).toEqual([])

    const live = await payload.create({
      collection: 'courses',
      data: { ...courseData('cache-b', heroImage), _status: 'published' },
      user: admin,
    })
    vi.mocked(revalidateTag).mockClear()
    await payload.delete({ collection: 'courses', id: live.id, user: admin })
    expect(expired()).toEqual(['courses', 'course:cache-b'])
  })

  it('unpublishing after a draft edit clears (the latest version is a draft then)', async () => {
    const course = await payload.create({
      collection: 'courses',
      data: { ...courseData('cache-d', heroImage), _status: 'published' },
      user: admin,
    })
    await payload.update({
      collection: 'courses',
      id: course.id,
      data: { tagline: 'Entwurf' },
      draft: true,
      user: admin,
    })
    vi.mocked(revalidateTag).mockClear()

    await payload.update({
      collection: 'courses',
      id: course.id,
      data: { _status: 'draft' },
      user: admin,
    })
    expect(expired()).toEqual(['courses', 'course:cache-d'])
  })

  it('saving a never-published course clears nothing', async () => {
    const draft = await payload.create({
      collection: 'courses',
      data: { ...courseData('cache-e', heroImage), _status: 'draft' },
      draft: true,
      user: admin,
    })
    await payload.update({
      collection: 'courses',
      id: draft.id,
      data: { tagline: 'Noch ein Entwurf', _status: 'draft' },
      user: admin,
    })
    expect(expired()).toEqual([])
  })

  it('the seed context skips revalidation', async () => {
    await payload.create({
      collection: 'courses',
      data: { ...courseData('cache-c', heroImage), _status: 'published' },
      user: admin,
      context: { disableRevalidate: true },
    })
    expect(expired()).toEqual([])
  })
})

describe('other collections', () => {
  it('price groups and reviews clear their own tag on publish', async () => {
    await payload.create({
      collection: 'price-groups',
      data: {
        kicker: 'Test',
        title: 'Cache',
        blocks: [{ name: 'A', badge: 'none', action: 'signup' }],
        _status: 'published',
      },
      user: admin,
    })
    await payload.create({
      collection: 'reviews',
      data: { author: 'Cache', text: 'Gut.', _status: 'published' },
      user: admin,
    })
    expect(expired()).toEqual(['price-groups', 'reviews'])
  })

  it('media changes clear the media tag', async () => {
    await payload.update({
      collection: 'media',
      id: heroImage,
      data: { alt: 'Neuer Text' },
      user: admin,
    })
    expect(expired()).toEqual(['media'])
  })

  it('redirect changes clear the redirects tag', async () => {
    await payload.create({
      collection: 'redirects',
      data: { from: '/cache-alt/', to: { type: 'custom', url: '/kurse/' } },
      user: admin,
    })
    expect(expired()).toEqual(['redirects'])
  })
})

describe('globals', () => {
  const contact = {
    phoneDisplay: '0175 5830372',
    phoneE164: '+491755830372',
    email: 'info@pranayogastudio.de',
    street: 'Weidkamp 176',
    postalCode: '45356',
    city: 'Essen-Borbeck',
  }

  it('business settings: draft saves clear nothing, publishing clears', async () => {
    await payload.updateGlobal({
      slug: 'business-settings',
      data: {
        contact,
        whatsApp: { groupUrl: 'https://chat.whatsapp.com/a' },
        _status: 'published',
      },
      user: admin,
    })
    expect(expired()).toEqual(['business-settings'])

    vi.mocked(revalidateTag).mockClear()
    await payload.updateGlobal({
      slug: 'business-settings',
      data: { whatsApp: { groupUrl: 'https://chat.whatsapp.com/b' } },
      draft: true,
      user: admin,
    })
    expect(expired()).toEqual([])
  })

  it('business settings: unpublishing after a draft edit clears', async () => {
    await payload.updateGlobal({
      slug: 'business-settings',
      data: {
        contact,
        whatsApp: { groupUrl: 'https://chat.whatsapp.com/c' },
        _status: 'published',
      },
      user: admin,
    })
    await payload.updateGlobal({
      slug: 'business-settings',
      data: { whatsApp: { groupUrl: 'https://chat.whatsapp.com/d' } },
      draft: true,
      user: admin,
    })
    vi.mocked(revalidateTag).mockClear()

    await payload.updateGlobal({
      slug: 'business-settings',
      data: { _status: 'draft' },
      user: admin,
    })
    expect(expired()).toEqual(['business-settings'])
  })

  it('technical settings: publishing clears', async () => {
    await payload.updateGlobal({
      slug: 'technical-settings',
      data: { siteUrl: 'http://localhost:3100', _status: 'published' },
      user: admin,
    })
    expect(expired()).toEqual(['technical-settings'])
  })
})
