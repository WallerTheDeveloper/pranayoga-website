import { describe, expect, it } from 'vitest'

import { toBusinessSettings, toReview, toTechnicalSettings } from '@/content/mappers/settings'
import type { BusinessSetting } from '@/payload-types'

import { mediaDoc, reviewDoc } from '../../fixtures/docs'

const business: Partial<BusinessSetting> = {
  contact: {
    phoneDisplay: '0175 5830372',
    phoneE164: '+491755830372',
    email: 'info@pranayogastudio.de',
    street: 'Weidkamp 176',
    postalCode: '45356',
    city: 'Essen-Borbeck',
  },
  whatsApp: {
    groupUrl: 'https://chat.whatsapp.com/abc',
    personalChatUrl: 'https://wa.me/491755830372',
  },
  social: {
    instagramUrl: 'https://www.instagram.com/pranayoga',
    facebookUrl: 'https://evil.example/fb',
    googleReviewsUrl: 'http://g.page/x',
  },
  bank: { accountHolder: null, bankName: 'Deutsche Bank', iban: 'de11360700240454838401' },
}

describe('toBusinessSettings', () => {
  it('maps valid values and builds links', () => {
    const view = toBusinessSettings(business)
    expect(view.contact).toMatchObject({
      phoneDisplay: '0175 5830372',
      phoneHref: 'tel:+491755830372',
      email: 'info@pranayogastudio.de',
      emailHref: 'mailto:info@pranayogastudio.de',
      cityLine: '45356 Essen-Borbeck',
    })
    expect(view.whatsApp.groupUrl).toBe('https://chat.whatsapp.com/abc')
    expect(view.bank.iban).toBe('DE11 3607 0024 0454 8384 01')
    expect(view.bank.accountHolder).toBeNull()
  })

  it('drops values that would make broken or unsafe links', () => {
    const view = toBusinessSettings(business)
    expect(view.social.instagramUrl).toBe('https://www.instagram.com/pranayoga')
    expect(view.social.facebookUrl).toBeNull()
    expect(view.social.googleReviewsUrl).toBeNull()

    const broken = toBusinessSettings({
      contact: { ...business.contact!, phoneE164: '0175', email: 'nope' },
      whatsApp: { groupUrl: 'https://example.com/join' },
      bank: { iban: 'DE00 0000' },
    })
    expect(broken.contact.phoneDisplay).toBeNull()
    expect(broken.contact.phoneHref).toBeNull()
    expect(broken.contact.emailHref).toBeNull()
    expect(broken.whatsApp.groupUrl).toBeNull()
    expect(broken.bank.iban).toBeNull()
  })

  it('handles a missing document', () => {
    const view = toBusinessSettings(null)
    expect(view.contact.cityLine).toBeNull()
    expect(view.whatsApp).toEqual({ groupUrl: null, personalChatUrl: null })
  })
})

describe('toTechnicalSettings', () => {
  it('fails safe without a document', () => {
    expect(toTechnicalSettings(null, 'http://localhost:3000/')).toEqual({
      siteUrl: 'http://localhost:3000',
      noindex: true,
      defaultSeo: { title: null, description: null, image: null },
      featureFlags: { introLoader: false, cookieBanner: false },
      googleMapsEmbedUrl: null,
    })
  })

  it('maps stored values and validates URLs', () => {
    const view = toTechnicalSettings(
      {
        siteUrl: 'https://pranayogastudio.de',
        noindex: false,
        defaultSeo: { title: 'Prana', image: mediaDoc() },
        featureFlags: { introLoader: true },
        googleMapsEmbedUrl: 'https://www.google.com/maps/embed?pb=x',
      },
      'http://localhost:3000',
    )
    expect(view).toMatchObject({
      siteUrl: 'https://pranayogastudio.de',
      noindex: false,
      featureFlags: { introLoader: true, cookieBanner: false },
      googleMapsEmbedUrl: 'https://www.google.com/maps/embed?pb=x',
    })
    expect(view.defaultSeo.title).toBe('Prana')
  })

  it('ignores an invalid site URL or map URL', () => {
    const view = toTechnicalSettings(
      { siteUrl: 'https://x.de/path', googleMapsEmbedUrl: 'https://evil.example/maps/embed' },
      'https://fallback.de',
    )
    expect(view.siteUrl).toBe('https://fallback.de')
    expect(view.googleMapsEmbedUrl).toBeNull()
  })
})

describe('toReview', () => {
  it('maps a review with its source', () => {
    expect(toReview(reviewDoc())).toEqual({
      id: '4',
      author: 'Alex',
      text: 'Tolles Studio.',
      source: 'Google-Bewertung',
    })
    expect(toReview(reviewDoc({ source: null }))?.source).toBe('Google-Bewertung')
  })

  it('drops reviews without author or text', () => {
    expect(toReview(reviewDoc({ author: '' }))).toBeNull()
    expect(toReview(reviewDoc({ text: ' ' }))).toBeNull()
  })
})
