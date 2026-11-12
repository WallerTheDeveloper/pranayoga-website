import type { Course, Media, PriceGroup, Review } from '@/payload-types'

/** Minimal Payload documents for mapper and component tests. Each call returns a fresh object. */

const STAMP = '2026-05-01T10:00:00.000Z'

export function mediaDoc(overrides: Partial<Media> = {}): Media {
  return {
    id: 7,
    alt: 'Yogalehrerin am Fenster',
    url: '/api/media/file/teacher.jpg',
    filename: 'teacher.jpg',
    width: 1200,
    height: 1800,
    focalX: 40,
    focalY: 30,
    sizes: {
      feature: { url: '/api/media/file/teacher-760x1140.jpg', width: 760, height: 1140 },
      card: { url: '/api/media/file/teacher-660x990.jpg', width: 660, height: 990 },
      small: { url: null, width: null, height: null },
    },
    createdAt: STAMP,
    updatedAt: STAMP,
    ...overrides,
  }
}

export function courseDoc(overrides: Partial<Course> = {}): Course {
  return {
    id: 1,
    title: 'Hatha Yoga',
    slug: 'hatha-yoga',
    icon: 'hatha',
    tagline: 'Sanft, für jeden geeignet',
    badge: { text: null, tone: null },
    cardTeaser: 'Gleichgewicht zwischen Körper und Geist.',
    cardImage: mediaDoc(),
    hero: {
      eyebrow: 'Kurs · sanft',
      lead: 'Ein sehr sanfter Yogastil.',
      audienceLabel: 'Für jeden geeignet',
      image: mediaDoc({ id: 8 }),
      secondaryImage: null,
    },
    audience: {
      heading: 'Für wen ist der Kurs?',
      paragraphs: [{ text: 'Für jeden.' }],
      quote: null,
    },
    steps: { heading: 'Drei Elemente', items: [{ title: 'Atmung', text: 'Pranayama.' }] },
    benefits: { heading: 'Wirkung', items: [{ title: 'Schlaf', text: 'Besser schlafen.' }] },
    schedule: [],
    faqs: [],
    seo: {},
    order: 1,
    _status: 'published',
    createdAt: STAMP,
    updatedAt: STAMP,
    ...overrides,
  }
}

type PriceBlock = NonNullable<PriceGroup['blocks']>[number]

export function priceBlock(overrides: Partial<PriceBlock> = {}): PriceBlock {
  return {
    id: 'block-1',
    name: '1× pro Woche',
    badge: 'none',
    price: 59,
    unit: 'pro Monat',
    inclusions: [{ text: 'Jeder Kurs nach Wunsch' }],
    action: 'signup',
    highlighted: false,
    isTrial: false,
    showInSignupForm: true,
    ...overrides,
  }
}

export function priceGroupDoc(overrides: Partial<PriceGroup> = {}): PriceGroup {
  return {
    id: 3,
    kicker: 'Mitgliedschaft',
    title: 'Regelmäßig üben',
    description: 'Monatlicher Beitrag.',
    blocks: [priceBlock()],
    order: 1,
    _status: 'published',
    createdAt: STAMP,
    updatedAt: STAMP,
    ...overrides,
  }
}

export function reviewDoc(overrides: Partial<Review> = {}): Review {
  return {
    id: 4,
    author: 'Alex',
    text: 'Tolles Studio.',
    source: 'Google-Bewertung',
    order: 1,
    _status: 'published',
    createdAt: STAMP,
    updatedAt: STAMP,
    ...overrides,
  }
}
