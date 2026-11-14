import type { Payload } from 'payload'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import type { BusinessSetting } from '@/payload-types'

import { closePayload, courseData, getTestPayload, uploadImage, wipeCollections } from './helpers'

const SYSTEM = { overrideAccess: true, context: { disableRevalidate: true } } as const

let payload: Payload
let bigImage: number
let smallImage: number

beforeAll(async () => {
  payload = await getTestPayload()
  await wipeCollections(payload)
  bigImage = await uploadImage(payload, 700, 900)
  smallImage = await uploadImage(payload, 400, 300)
})

afterAll(async () => {
  await closePayload(payload)
})

/** Matches a Payload ValidationError that names the field path (and, optionally, the message). */
function fieldError(path: string, message?: RegExp) {
  const error = message ? { path, message: expect.stringMatching(message) } : { path }
  return expect.objectContaining({
    data: expect.objectContaining({
      errors: expect.arrayContaining([expect.objectContaining(error)]),
    }),
  })
}

const validBusiness: Omit<BusinessSetting, 'id'> = {
  contact: {
    phoneDisplay: '0175 5830372',
    phoneE164: '+491755830372',
    email: 'info@pranayogastudio.de',
    street: 'Weidkamp 176',
    postalCode: '45356',
    city: 'Essen-Borbeck',
  },
  whatsApp: { groupUrl: 'https://chat.whatsapp.com/abc' },
  _status: 'published',
}

function updateBusiness(data: Partial<BusinessSetting>) {
  return payload.updateGlobal({
    slug: 'business-settings',
    data: { ...validBusiness, ...data },
    draft: false,
    ...SYSTEM,
  })
}

describe('business settings', () => {
  it('accepts valid contact data', async () => {
    const doc = await updateBusiness({ bank: { iban: 'DE11 3607 0024 0454 8384 01' } })
    expect(doc.contact.postalCode).toBe('45356')
  })

  it.each([
    ['contact.phoneE164', { contact: { ...validBusiness.contact, phoneE164: '0175 5830372' } }],
    ['contact.postalCode', { contact: { ...validBusiness.contact, postalCode: '4535' } }],
    ['whatsApp.groupUrl', { whatsApp: { groupUrl: 'https://example.com/group' } }],
    ['social.instagramUrl', { social: { instagramUrl: 'https://evil.example/prana' } }],
    ['social.googleReviewsUrl', { social: { googleReviewsUrl: 'http://g.page/x' } }],
    ['bank.iban', { bank: { iban: 'DE00 1234 5678 9012 3456 78' } }],
  ] as const)('rejects an invalid %s', async (path, data) => {
    await expect(updateBusiness(data as Partial<BusinessSetting>)).rejects.toEqual(fieldError(path))
  })
})

describe('technical settings', () => {
  it('rejects a site URL with a path and a non-embed map URL', async () => {
    await expect(
      payload.updateGlobal({
        slug: 'technical-settings',
        data: { siteUrl: 'https://pranayogastudio.de/kurse' },
        ...SYSTEM,
      }),
    ).rejects.toEqual(fieldError('siteUrl'))
    await expect(
      payload.updateGlobal({
        slug: 'technical-settings',
        data: {
          siteUrl: 'https://pranayogastudio.de',
          googleMapsEmbedUrl: 'https://www.google.com/maps/place/x',
        },
        ...SYSTEM,
      }),
    ).rejects.toEqual(fieldError('googleMapsEmbedUrl'))
  })
})

describe('courses', () => {
  it('refuses a hero image below the feature size', async () => {
    await expect(
      payload.create({
        collection: 'courses',
        data: { ...courseData('small-hero', smallImage), _status: 'published' },
        ...SYSTEM,
      }),
    ).rejects.toEqual(fieldError('hero.image'))
  })

  it('refuses schedule times that are malformed or end before they start', async () => {
    await expect(
      payload.create({
        collection: 'courses',
        data: {
          ...courseData('bad-time', bigImage),
          schedule: [{ weekday: 'monday', start: '9:30' }],
          _status: 'published',
        },
        ...SYSTEM,
      }),
    ).rejects.toEqual(fieldError('schedule.0.start'))
    await expect(
      payload.create({
        collection: 'courses',
        data: {
          ...courseData('bad-end', bigImage),
          schedule: [{ weekday: 'monday', start: '18:00', end: '17:00' }],
          _status: 'published',
        },
        ...SYSTEM,
      }),
    ).rejects.toEqual(fieldError('schedule.0.end'))
  })

  it('accepts a valid schedule', async () => {
    const course = await payload.create({
      collection: 'courses',
      data: {
        ...courseData('good-time', bigImage),
        schedule: [{ weekday: 'monday', start: '18:00', end: '19:30' }],
        _status: 'published',
      },
      ...SYSTEM,
    })
    expect(course.schedule).toHaveLength(1)
  })
})

describe('price groups', () => {
  const trialGroup = (title: string) => ({
    kicker: 'Einstieg',
    title,
    blocks: [
      { name: 'Probestunde', badge: 'none' as const, action: 'whatsapp' as const, isTrial: true },
    ],
    _status: 'published' as const,
  })

  it('refuses negative prices', async () => {
    await expect(
      payload.create({
        collection: 'price-groups',
        data: {
          kicker: 'Test',
          title: 'Negativ',
          blocks: [{ name: 'X', badge: 'none', action: 'signup', price: -5 }],
          _status: 'published',
        },
        ...SYSTEM,
      }),
    ).rejects.toEqual(fieldError('blocks.0.price'))
  })

  it('allows one trial block site-wide and names the holder on a second', async () => {
    const first = await payload.create({
      collection: 'price-groups',
      data: trialGroup('Erste'),
      ...SYSTEM,
    })
    await expect(
      payload.create({ collection: 'price-groups', data: trialGroup('Zweite'), ...SYSTEM }),
    ).rejects.toEqual(fieldError('blocks', /„Erste“/))

    // Drafts may carry the mark; only publishing is checked.
    await expect(
      payload.create({
        collection: 'price-groups',
        data: { ...trialGroup('Entwurf'), _status: 'draft' },
        draft: true,
        ...SYSTEM,
      }),
    ).resolves.toBeDefined()

    // Re-publishing the holder itself is fine.
    await expect(
      payload.update({
        collection: 'price-groups',
        id: first.id,
        data: { title: 'Erste neu' },
        ...SYSTEM,
      }),
    ).resolves.toMatchObject({ title: 'Erste neu' })
  })

  it('refuses two trial blocks in one group', async () => {
    await expect(
      payload
        .create({
          collection: 'price-groups',
          data: {
            ...trialGroup('Doppelt'),
            blocks: [
              { name: 'A', badge: 'none', action: 'whatsapp', isTrial: true },
              { name: 'B', badge: 'none', action: 'whatsapp', isTrial: true },
            ],
            _status: 'draft',
          },
          draft: true,
          ...SYSTEM,
        })
        .then((doc) =>
          payload.update({
            collection: 'price-groups',
            id: doc.id,
            data: { _status: 'published' },
            ...SYSTEM,
          }),
        ),
    ).rejects.toEqual(fieldError('blocks', /mehr als ein Block/))
  })
})

describe('redirects', () => {
  it('normalises the old path', async () => {
    const redirect = await payload.create({
      collection: 'redirects',
      data: {
        from: 'https://pranayogastudio.de/Kurse/Yin-Yoga',
        to: { type: 'custom', url: '/kurse/' },
      },
      ...SYSTEM,
    })
    expect(redirect.from).toBe('/kurse/yin-yoga/')
  })

  it('refuses reserved sources and unsafe targets', async () => {
    await expect(
      payload.create({
        collection: 'redirects',
        data: { from: '/admin/', to: { type: 'custom', url: '/kurse/' } },
        ...SYSTEM,
      }),
    ).rejects.toEqual(fieldError('from'))
    await expect(
      payload.create({
        collection: 'redirects',
        data: { from: '/alt/', to: { type: 'custom', url: '//evil.example' } },
        ...SYSTEM,
      }),
    ).rejects.toEqual(fieldError('to.url'))
  })

  it('refuses a redirect to itself and one that closes a loop', async () => {
    await expect(
      payload.create({
        collection: 'redirects',
        data: { from: '/kreis/', to: { type: 'custom', url: '/Kreis' } },
        ...SYSTEM,
      }),
    ).rejects.toEqual(fieldError('to.url'))

    const first = await payload.create({
      collection: 'redirects',
      data: { from: '/schleife-a/', to: { type: 'custom', url: '/schleife-b/' } },
      ...SYSTEM,
    })
    await expect(
      payload.create({
        collection: 'redirects',
        data: { from: '/schleife-b/', to: { type: 'custom', url: '/schleife-a/' } },
        ...SYSTEM,
      }),
    ).rejects.toEqual(fieldError('to.url'))

    // Saving the first one again is fine: it is not compared with itself.
    await expect(
      payload.update({
        collection: 'redirects',
        id: first.id,
        data: { to: { type: 'custom', url: '/schleife-b/' } },
        ...SYSTEM,
      }),
    ).resolves.toMatchObject({ from: '/schleife-a/' })
  })
})

describe('media in use', () => {
  it('refuses to delete an image a course shows, and allows unused ones', async () => {
    const used = await uploadImage(payload, 700, 900, 'int-used.jpg')
    await payload.create({
      collection: 'courses',
      data: { ...courseData('uses-image', used), _status: 'published' },
      ...SYSTEM,
    })
    await expect(
      payload.delete({ collection: 'media', id: used, ...SYSTEM }),
    ).rejects.toMatchObject({
      status: 409,
    })

    const unused = await uploadImage(payload, 700, 900, 'int-unused.jpg')
    await expect(
      payload.delete({ collection: 'media', id: unused, ...SYSTEM }),
    ).resolves.toBeDefined()
  })

  it('refuses to delete an image only an unpublished settings draft shows', async () => {
    const draftOnly = await uploadImage(payload, 700, 900, 'int-draft-seo.jpg')
    const saveDraft = (image: number | null) =>
      payload.updateGlobal({
        slug: 'technical-settings',
        data: { defaultSeo: { image } },
        draft: true,
        ...SYSTEM,
      })
    await saveDraft(draftOnly)
    try {
      await expect(
        payload.delete({ collection: 'media', id: draftOnly, ...SYSTEM }),
      ).rejects.toMatchObject({ status: 409 })
    } finally {
      await saveDraft(null)
    }
  })

  it('refuses to delete an image the copy modules reference by name', async () => {
    const copyImage = await uploadImage(payload, 700, 900, 'liudmyla-studio-window.jpg')
    await expect(payload.delete({ collection: 'media', id: copyImage, ...SYSTEM })).rejects.toThrow(
      /Startseite: Titelbild/,
    )
  })
})
