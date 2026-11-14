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
  /** "Für jeden geeignet": the overview cards' "Für wen" line and the hero tag. */
  audienceLabel: string | null
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

/** A price block linked to a course, shown in its hero: "Yoga für Jugendliche: 45 €". */
export interface CoursePriceLine {
  name: string
  priceLabel: string
  unit: string | null
}

export interface CourseDetail extends CourseSummary {
  hero: {
    eyebrow: string | null
    lead: string
    image: ImageData | null
    secondaryImage: ImageData | null
  }
  /** Null unless a price block with a price points at this course. */
  priceLine: CoursePriceLine | null
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
  /** The course whose page shows this price, if any. */
  courseId: number | null
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

export interface TeacherTrainingFact {
  value: string
  label: string
}

export interface TeacherTrainingTopic {
  title: string
  text: string | null
}

/**
 * The teacher-training page's admin data. Every value is null (or empty) until the studio fills
 * it in, and the page leaves out what is missing.
 */
export interface TeacherTrainingPageView {
  startMonthLabel: string | null
  endMonthLabel: string | null
  priceLabel: string | null
  depositLabel: string | null
  /** "14 Tage": reads after "fällig" and "spätestens". */
  depositDeadline: string | null
  balanceDeadline: string | null
  membershipDiscount: string | null
  /** One label per weekend, in admin order: "14.–15. März 2027". */
  weekends: string[]
  /** "14. März 2027": the first day of the first weekend. */
  firstDayLabel: string | null
  topics: TeacherTrainingTopic[]
  requirements: string[]
  certification: string | null
  flyer: {
    image: ImageData | null
    /** The full-size flyer image, for "Flyer öffnen" when there is no PDF. */
    imageHref: string | null
  }
}

export interface DownloadView {
  title: string
  /** Same-site path with a `?v=` version. */
  href: string
}

/** Rich text as Payload stores it (Lexical JSON). Rendered by the RichText component. */
export interface RichTextData {
  root: {
    type: string
    children: { type: string; version: number; [key: string]: unknown }[]
    direction: ('ltr' | 'rtl') | null
    format: 'left' | 'start' | 'center' | 'right' | 'end' | 'justify' | ''
    indent: number
    version: number
  }
  [key: string]: unknown
}

export interface LegalPageView {
  /** "12. November 2026"; null when the admin left "Stand" empty. */
  updatedOnLabel: string | null
  /** Null while the text is empty. */
  content: RichTextData | null
}

export interface SignupPlan {
  /** The price block id: the form's option value. */
  id: string
  /** "1× pro Woche – 59 € pro Monat". */
  label: string
}

export interface SignupPlanGroup {
  /** The group's kicker, "Mitgliedschaft": the option group label. */
  label: string
  plans: SignupPlan[]
}

/** The teacher training: what the shared teaser shows. */
export interface TeacherTrainingView {
  /** "März 2027"; null when no start month is set. */
  startMonthLabel: string | null
  price: number | null
  priceLabel: string | null
  teaser: {
    heading: string
    text: string | null
    facts: TeacherTrainingFact[]
    priceNote: string | null
  }
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
