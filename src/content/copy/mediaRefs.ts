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
} as const satisfies Record<string, CopyMediaRef>

export type CopyMediaKey = keyof typeof COPY_MEDIA

export const COPY_MEDIA_KEYS = Object.keys(COPY_MEDIA) as CopyMediaKey[]

export const COPY_MEDIA_PLACES: ReadonlyMap<string, string> = new Map(
  Object.values(COPY_MEDIA).map((ref) => [ref.filename, ref.place]),
)
