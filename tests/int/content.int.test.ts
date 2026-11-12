import { unstable_cache } from 'next/cache'
import type { Payload } from 'payload'
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest'

import {
  findRedirect,
  getBusinessSettings,
  getCopyImages,
  getCourse,
  getCourses,
  getPageCopy,
  getPriceGroups,
  getReviews,
  getTechnicalSettings,
  getTrialOffer,
} from '@/content'
import { redirectTarget } from '@/content/redirects'
import { getReadMode } from '@/content/source'

import { nextState, resetNextState } from '../setup/nextState'
import {
  ADMIN_EMAIL,
  ADMIN_PASSWORD,
  adminUser,
  closePayload,
  courseData,
  getTestPayload,
  uploadImage,
  wipeCollections,
} from './helpers'

/** The repository layer against the test database, in both read modes. */

const SYSTEM = { overrideAccess: true, context: { disableRevalidate: true } } as const

let payload: Payload
let adminHeaders: Headers

beforeAll(async () => {
  payload = await getTestPayload()
  await wipeCollections(payload)
  await adminUser(payload)
  const { token } = await payload.login({
    collection: 'users',
    data: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD },
  })
  adminHeaders = new Headers({ Authorization: `JWT ${token}` })

  const hero = await uploadImage(payload, 700, 900)
  await uploadImage(payload, 900, 1200, 'liudmyla-studio-window.jpg')

  const live = await payload.create({
    collection: 'courses',
    data: {
      ...courseData('content-live', hero),
      order: 2,
      faqs: [
        { question: 'Was kostet eine Probestunde?', answer: 'Sie kostet [Preis Probestunde].' },
        { question: 'Wie lange?', answer: 'Mindestens [Monate].' },
      ],
      _status: 'published',
    },
    ...SYSTEM,
  })
  await payload.create({
    collection: 'courses',
    data: { ...courseData('content-first', hero), order: 1, _status: 'published' },
    ...SYSTEM,
  })
  await payload.create({
    collection: 'courses',
    data: { ...courseData('content-draft', hero), _status: 'draft' },
    draft: true,
    ...SYSTEM,
  })

  await payload.create({
    collection: 'price-groups',
    data: {
      kicker: 'Einstieg',
      title: 'Probestunde',
      blocks: [
        {
          name: 'Probestunde',
          badge: 'none',
          action: 'whatsapp',
          price: 15,
          unit: 'einmalig',
          isTrial: true,
        },
      ],
      _status: 'published',
    },
    ...SYSTEM,
  })
  await payload.create({
    collection: 'reviews',
    data: { author: 'Alex', text: 'Tolles Studio.', _status: 'published' },
    ...SYSTEM,
  })
  await payload.create({
    collection: 'reviews',
    data: { author: 'Entwurf', text: 'Noch nicht live.', _status: 'draft' },
    draft: true,
    ...SYSTEM,
  })

  await payload.updateGlobal({
    slug: 'business-settings',
    data: {
      contact: {
        phoneDisplay: '0175 5830372',
        phoneE164: '+491755830372',
        email: 'info@pranayogastudio.de',
        street: 'Weidkamp 176',
        postalCode: '45356',
        city: 'Essen-Borbeck',
      },
      whatsApp: { groupUrl: 'https://chat.whatsapp.com/live' },
      _status: 'published',
    },
    draft: false,
    ...SYSTEM,
  })
  await payload.updateGlobal({
    slug: 'business-settings',
    data: { whatsApp: { groupUrl: 'https://chat.whatsapp.com/draft' } },
    draft: true,
    ...SYSTEM,
  })
  await payload.updateGlobal({
    slug: 'technical-settings',
    data: { siteUrl: 'https://pranayogastudio.de', noindex: true, _status: 'published' },
    draft: false,
    ...SYSTEM,
  })

  await payload.create({
    collection: 'redirects',
    data: {
      from: '/kurse/yin-yoga/',
      to: { type: 'reference', reference: { relationTo: 'courses', value: live.id } },
    },
    ...SYSTEM,
  })
  await payload.create({
    collection: 'redirects',
    data: { from: '/alte-seite/', to: { type: 'custom', url: '/kontakt/' } },
    ...SYSTEM,
  })
})

afterEach(() => {
  resetNextState()
})

afterAll(async () => {
  await closePayload(payload)
})

describe('published reads', () => {
  it('lists published courses in admin order, through the tagged cache', async () => {
    vi.mocked(unstable_cache).mockClear()
    const courses = await getCourses()
    expect(courses.map((course) => course.slug)).toEqual(['content-first', 'content-live'])
    expect(vi.mocked(unstable_cache)).toHaveBeenCalledWith(
      expect.any(Function),
      ['content', 'courses'],
      {
        tags: ['courses', 'media'],
        revalidate: false,
      },
    )
  })

  it('loads a course page with the trial price filled in', async () => {
    const course = await getCourse('content-live')
    expect(course?.hero.image?.src).toMatch(/^\/api\/media\/file\//)
    // de-DE puts a no-break space between amount and currency.
    expect(course?.faqs).toEqual([
      { question: 'Was kostet eine Probestunde?', answer: 'Sie kostet 15 €.' },
    ])
  })

  it('returns null for drafts, unknown and invalid slugs', async () => {
    expect(await getCourse('content-draft')).toBeNull()
    expect(await getCourse('does-not-exist')).toBeNull()
    expect(await getCourse('../admin')).toBeNull()
  })

  it('reads prices, the trial offer and reviews', async () => {
    expect(await getPriceGroups()).toHaveLength(1)
    expect(await getTrialOffer()).toMatchObject({
      name: 'Probestunde',
      price: 15,
      unit: 'einmalig',
    })
    expect((await getReviews()).map((review) => review.author)).toEqual(['Alex'])
  })

  it('reads the published settings, not the draft', async () => {
    const settings = await getBusinessSettings()
    expect(settings.whatsApp.groupUrl).toBe('https://chat.whatsapp.com/live')
    expect(settings.contact.cityLine).toBe('45356 Essen-Borbeck')
    const technical = await getTechnicalSettings()
    expect(technical).toMatchObject({ siteUrl: 'https://pranayogastudio.de', noindex: true })
  })

  it('resolves copy images by file name', async () => {
    const images = await getCopyImages()
    expect(images.homeHero?.alt).toMatch(/Testbild/)
    expect(images.teacherPortrait).toBeNull()
  })

  it('serves the typed copy', async () => {
    expect((await getPageCopy('home')).hero.heading.accent).toBe('gesunden Körper.')
  })
})

describe('redirects', () => {
  it('finds course and custom targets for normalised paths', async () => {
    expect(await findRedirect('/kurse/Yin-Yoga')).toBe('/kurse/content-live/')
    expect(await findRedirect('/alte-seite/')).toBe('/kontakt/')
    expect(await findRedirect('/unbekannt/')).toBeNull()
    expect(await findRedirect('/admin/')).toBeNull()
  })

  it('drops broken targets', () => {
    expect(
      redirectTarget({ to: { type: 'reference', reference: { relationTo: 'courses', value: 5 } } }),
    ).toBeNull()
    expect(redirectTarget({ to: { type: 'custom', url: '//evil.example' } })).toBeNull()
    expect(redirectTarget({ to: { type: 'custom', url: '' } })).toBeNull()
    expect(redirectTarget({})).toBeNull()
  })
})

describe('draft mode', () => {
  it('stays on published content without an admin session', async () => {
    nextState.draftMode = true
    expect(await getReadMode()).toBe('published')
    expect((await getCourses()).map((course) => course.slug)).not.toContain('content-draft')
  })

  it('shows drafts, uncached, to a logged-in admin', async () => {
    nextState.draftMode = true
    nextState.headers = adminHeaders
    vi.mocked(unstable_cache).mockClear()

    expect(await getReadMode()).toBe('draft')
    expect((await getCourses()).map((course) => course.slug)).toContain('content-draft')
    expect((await getReviews()).map((review) => review.author)).toContain('Entwurf')
    expect((await getBusinessSettings()).whatsApp.groupUrl).toBe('https://chat.whatsapp.com/draft')
    expect(vi.mocked(unstable_cache)).not.toHaveBeenCalled()
  })
})
