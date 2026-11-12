import type { BusinessSetting } from '../../src/payload-types'

/**
 * Business details from the design and the studio's current site. The WhatsApp group link is the
 * design's bare placeholder: the studio must paste the real invite link before launch. Social and
 * Google review links are left empty, so those buttons stay hidden until they are filled in.
 */
export const seedBusinessSettings: Omit<BusinessSetting, 'id' | 'createdAt' | 'updatedAt'> = {
  contact: {
    phoneDisplay: '0175 5830372',
    phoneE164: '+491755830372',
    email: 'info@pranayogastudio.de',
    street: 'Weidkamp 176',
    postalCode: '45356',
    city: 'Essen-Borbeck',
  },
  whatsApp: {
    groupUrl: 'https://chat.whatsapp.com/',
    personalChatUrl: 'https://wa.me/491755830372',
  },
  social: {
    instagramUrl: null,
    facebookUrl: null,
    googleReviewsUrl: null,
  },
  bank: {
    accountHolder: null,
    bankName: 'Deutsche Bank',
    iban: 'DE11 3607 0024 0454 8384 01',
    paymentReference: null,
  },
}

/** Filled at seed time: siteUrl comes from the environment, the image from the uploaded media. */
export const seedTechnicalDefaults = {
  noindex: true,
  defaultSeoTitle: 'Prana Yoga Studio Essen',
  defaultSeoImage: 'liudmyla-studio-window.jpg',
  featureFlags: { introLoader: false, cookieBanner: false },
} as const
