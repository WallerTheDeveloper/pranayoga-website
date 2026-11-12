import type { CourseIconName } from '@/components/icons/courseIconNames'
import type { Weekday } from '@/lib/format'

/**
 * View models returned by the content layer. Components only ever see these, never Payload
 * documents, so promoting a copy text to the admin later changes one repository function only.
 * Optional admin values are `null` when empty or still holding a `[…]` placeholder.
 */

export interface ImageData {
  /** Same-site path with a `?v=` version, ready for next/image. */
  src: string
  alt: string
  width: number
  height: number
  /** CSS object-position from the admin's focal point. */
  objectPosition: string
}

export type BadgeTone = 'light' | 'dark'

export interface CourseBadge {
  text: string
  tone: BadgeTone
}

export interface CourseSummary {
  slug: string
  href: string
  title: string
  icon: CourseIconName
  tagline: string
  badge: CourseBadge | null
  cardTeaser: string
  cardImage: ImageData | null
}

export interface CourseStep {
  title: string
  text: string
  image: ImageData | null
}

export interface ScheduleEntry {
  weekday: Weekday
  weekdayLabel: string
  timeLabel: string
}

export interface FaqEntry {
  question: string
  answer: string
}

export interface SeoData {
  title: string | null
  description: string | null
  image: ImageData | null
}

export interface CourseDetail extends CourseSummary {
  hero: {
    eyebrow: string | null
    lead: string
    audienceLabel: string | null
    image: ImageData | null
    secondaryImage: ImageData | null
  }
  audience: {
    heading: string | null
    paragraphs: string[]
    quote: string | null
  }
  steps: { heading: string | null; items: CourseStep[] }
  benefits: { heading: string | null; items: CourseStep[]; sideImage: ImageData | null }
  schedule: ScheduleEntry[]
  faqs: FaqEntry[]
  seo: SeoData
}

export type PriceBadge = 'popular' | 'promo'
export type PriceAction = 'signup' | 'whatsapp'

export interface PriceBlockView {
  id: string
  name: string
  badge: PriceBadge | null
  highlighted: boolean
  price: number | null
  /** "15 €"; null when no price is set yet. */
  priceLabel: string | null
  unit: string | null
  inclusions: string[]
  action: PriceAction
  isTrial: boolean
  showInSignupForm: boolean
}

export interface PriceGroupView {
  id: string
  kicker: string
  title: string
  description: string | null
  blocks: PriceBlockView[]
}

export interface TrialOffer {
  name: string
  price: number | null
  priceLabel: string | null
  unit: string | null
}

export interface ReviewView {
  id: string
  author: string
  text: string
  source: string
}

export interface ContactData {
  phoneDisplay: string | null
  phoneHref: string | null
  email: string | null
  emailHref: string | null
  street: string | null
  postalCode: string | null
  city: string | null
  /** "45356 Essen-Borbeck"; null when either part is missing. */
  cityLine: string | null
}

export interface BusinessSettingsView {
  contact: ContactData
  whatsApp: { groupUrl: string | null; personalChatUrl: string | null }
  social: {
    instagramUrl: string | null
    facebookUrl: string | null
    googleReviewsUrl: string | null
  }
  bank: {
    accountHolder: string | null
    bankName: string | null
    /** Grouped in fours. */
    iban: string | null
    paymentReference: string | null
  }
}

export interface TechnicalSettingsView {
  siteUrl: string
  noindex: boolean
  defaultSeo: SeoData
  featureFlags: { introLoader: boolean; cookieBanner: boolean }
  googleMapsEmbedUrl: string | null
}
