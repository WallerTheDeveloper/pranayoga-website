import type { ImageTier } from '@/lib/validation/imageTier'

/**
 * Images the typed copy modules reference by file name. The seed uploads them; the content layer
 * resolves them at render time. The media collection refuses to delete any of them.
 */
export interface CopyMediaRef {
  readonly filename: string
  readonly tier: ImageTier
  /** Where the image appears, shown in the "still in use" error. */
  readonly place: string
}

export const COPY_MEDIA = {
  homeHero: {
    filename: 'liudmyla-studio-window.jpg',
    tier: 'feature',
    place: 'Startseite: Titelbild',
  },
  teacherPortrait: {
    filename: 'teacher-balance-window.jpg',
    tier: 'card',
    place: 'Startseite: Ihre Lehrerin',
  },
  sealEryt200: {
    filename: 'seal-e-ryt-200.png',
    tier: 'small',
    place: 'Startseite: Yoga-Alliance-Siegel',
  },
  sealEryt500: {
    filename: 'seal-e-ryt-500.png',
    tier: 'small',
    place: 'Startseite: Yoga-Alliance-Siegel',
  },
  sealYacep: {
    filename: 'seal-yacep.png',
    tier: 'small',
    place: 'Startseite: Yoga-Alliance-Siegel',
  },
  newWheelYoga: {
    filename: 'wheel-yoga-two-wheels.jpg',
    tier: 'card',
    place: 'Startseite: Neu im Studio',
  },
  newSportBalance: {
    filename: 'sport-balance-headstand-wall.jpg',
    tier: 'card',
    place: 'Startseite: Neu im Studio',
  },
  coursesHero: {
    filename: 'courses-forward-bend-straddle.jpg',
    tier: 'feature',
    place: 'Kurse: Titelbild',
  },
  coursesBringAlong: {
    filename: 'courses-relaxed-cross-legged.jpg',
    tier: 'card',
    place: 'Kurse: Was benötige ich?',
  },
  teacherSmall: {
    filename: 'liudmyla-studio-window.jpg',
    tier: 'small',
    place: 'Kursseiten: Ihre Lehrerin',
  },
  aboutHero: {
    filename: 'liudmyla-studio-window.jpg',
    tier: 'feature',
    place: 'Über uns: Titelbild',
  },
  galleryBeachHandstand: {
    filename: 'about-beach-handstand.jpg',
    tier: 'card',
    place: 'Über uns: Yoga unterwegs',
  },
  galleryCliffBalance: {
    filename: 'about-cliff-standing-balance.jpg',
    tier: 'card',
    place: 'Über uns: Yoga unterwegs',
  },
  galleryBeachSidePlank: {
    filename: 'about-beach-side-plank.jpg',
    tier: 'card',
    place: 'Über uns: Yoga unterwegs',
  },
  galleryBeachArmBalance: {
    filename: 'about-beach-arm-balance.jpg',
    tier: 'card',
    place: 'Über uns: Yoga unterwegs',
  },
  // Certificates use the large size: the lightbox shows them up to 900 px wide.
  certificateHatha: {
    filename: 'certificate-hatha-200.jpg',
    tier: 'feature',
    place: 'Über uns: Zertifikate',
  },
  certificateYin: {
    filename: 'certificate-yin-50.jpg',
    tier: 'feature',
    place: 'Über uns: Zertifikate',
  },
  certificatePrenatal: {
    filename: 'certificate-prenatal-85.jpg',
    tier: 'feature',
    place: 'Über uns: Zertifikate',
  },
  certificateAppreciation: {
    filename: 'certificate-ukrainian-yoga-alliance.jpg',
    tier: 'feature',
    place: 'Über uns: Zertifikate',
  },
  certificateIntroduction: {
    filename: 'certificate-introduction-yoga.jpg',
    tier: 'feature',
    place: 'Über uns: Zertifikate',
  },
  certificateIntroductionRu: {
    filename: 'certificate-introduction-yoga-ru.jpg',
    tier: 'feature',
    place: 'Über uns: Zertifikate',
  },
  aboutStudio: {
    filename: 'wheel-yoga-class-studio.jpg',
    tier: 'feature',
    place: 'Über uns: Das Studio',
  },
  teacherTrainingHero: {
    filename: 'teacher-training-reverse-prayer.jpg',
    tier: 'feature',
    place: 'Yogaausbildungen: Titelbild',
  },
  pricingHero: {
    filename: 'pricing-cross-legged-arms-up.jpg',
    tier: 'feature',
    place: 'Mitgliedschaft & Preise: Titelbild',
  },
  contactHero: {
    filename: 'contact-side-stretch-window.jpg',
    tier: 'feature',
    place: 'Kontakt: Titelbild',
  },
} as const satisfies Record<string, CopyMediaRef>

export type CopyMediaKey = keyof typeof COPY_MEDIA

export const COPY_MEDIA_KEYS = Object.keys(COPY_MEDIA) as CopyMediaKey[]

/** File name → every place that shows it; one file may serve several places. */
export const COPY_MEDIA_PLACES: ReadonlyMap<string, string> = new Map(
  [...new Set(Object.values(COPY_MEDIA).map((ref) => ref.filename))].map((filename) => [
    filename,
    Object.values(COPY_MEDIA)
      .filter((ref) => ref.filename === filename)
      .map((ref) => ref.place)
      .join('; '),
  ]),
)
