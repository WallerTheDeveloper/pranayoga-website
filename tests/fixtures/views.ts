import { COPY_MEDIA_KEYS } from '@/content/copy/mediaRefs'
import { toBusinessSettings } from '@/content/mappers/settings'
import type { CopyImages } from '@/content/media'
import type { BusinessSettingsView, CourseSummary, ImageData } from '@/content/types'

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
