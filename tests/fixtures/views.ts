import { COPY_MEDIA_KEYS } from '@/content/copy/mediaRefs'
import { toBusinessSettings } from '@/content/mappers/settings'
import type { CopyImages } from '@/content/media'
import type {
  BusinessSettingsView,
  CourseDetail,
  CourseSummary,
  ImageData,
  TeacherTrainingView,
} from '@/content/types'

/** View models for component tests. */

export function imageData(overrides: Partial<ImageData> = {}): ImageData {
  return {
    src: '/api/media/file/photo.jpg?v=1',
    alt: 'Foto aus dem Studio',
    width: 660,
    height: 990,
    objectPosition: '50% 50%',
    ...overrides,
  }
}

export function copyImages(filled = true): CopyImages {
  return Object.fromEntries(
    COPY_MEDIA_KEYS.map((key) => [key, filled ? imageData({ alt: `Bild ${key}` }) : null]),
  ) as CopyImages
}

export function settingsView(
  overrides: Partial<Parameters<typeof toBusinessSettings>[0]> = {},
): BusinessSettingsView {
  return toBusinessSettings({
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
    social: { instagramUrl: 'https://www.instagram.com/prana', facebookUrl: null },
    ...overrides,
  })
}

export function courseSummary(overrides: Partial<CourseSummary> = {}): CourseSummary {
  return {
    slug: 'hatha-yoga',
    href: '/kurse/hatha-yoga/',
    title: 'Hatha Yoga',
    icon: 'hatha',
    tagline: 'Sanft, für jeden geeignet',
    badge: null,
    cardTeaser: 'Gleichgewicht zwischen Körper und Geist.',
    cardImage: imageData(),
    audienceLabel: 'Für jeden geeignet',
    ...overrides,
  }
}

export const COURSES: readonly CourseSummary[] = [
  courseSummary(),
  courseSummary({
    slug: 'rad-yoga',
    href: '/kurse/rad-yoga/',
    title: 'Rad Yoga',
    icon: 'wheel',
    tagline: 'Mit dem Yoga-Rad',
    badge: { text: 'Neu', tone: 'dark' },
  }),
]

export function courseDetail(overrides: Partial<CourseDetail> = {}): CourseDetail {
  return {
    ...courseSummary(),
    hero: {
      eyebrow: 'Sanft und kräftigend',
      lead: 'Hatha Yoga verbindet Haltungen, Atmung und Entspannung.',
      image: imageData({ width: 900, height: 600, alt: 'Hatha Yoga im Studio' }),
      secondaryImage: imageData({ alt: 'Boot-Haltung' }),
    },
    priceLine: null,
    audience: {
      heading: 'Für wen ist der Kurs?',
      paragraphs: ['Für Einsteiger und Geübte.', 'Jede Haltung lässt sich anpassen.'],
      quote: null,
    },
    steps: {
      heading: 'So läuft eine Stunde ab',
      items: [
        { title: 'Ankommen', text: 'Wir beginnen mit dem Atem.', image: null },
        { title: 'Asanas', text: 'Haltungen im eigenen Tempo.', image: null },
      ],
    },
    benefits: {
      heading: 'Was Hatha Yoga bewirkt',
      items: [{ title: 'Beweglichkeit', text: 'Der Körper wird geschmeidiger.', image: null }],
      sideImage: null,
    },
    schedule: [],
    faqs: [
      { question: 'Brauche ich Vorkenntnisse?', answer: 'Nein.' },
      { question: 'Was kostet eine Probestunde?', answer: '15 €.' },
    ],
    seo: { title: null, description: null, image: null },
    ...overrides,
  }
}

export function teacherTrainingView(
  overrides: Partial<TeacherTrainingView> = {},
): TeacherTrainingView {
  return {
    startMonthLabel: 'März 2027',
    price: 2400,
    priceLabel: '2.400\u00a0€',
    teaser: {
      heading: 'Werden Sie selbst Yogalehrerin oder Yogalehrer.',
      text: 'Lernen Sie bei Liudmyla Schiemann, selbst Yoga zu unterrichten.',
      facts: [
        { value: '200 Stunden', label: 'Theorie und Praxis' },
        { value: '9 Wochenenden', label: 'ein Wochenende pro Monat im Studio' },
      ],
      priceNote: 'inkl. Arbeitsmaterial',
    },
    ...overrides,
  }
}
