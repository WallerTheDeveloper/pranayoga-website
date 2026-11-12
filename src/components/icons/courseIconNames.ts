/**
 * The six course icons (Main.dc.html §05). Plain data so the Payload schema can import it
 * without pulling in React.
 */
export const COURSE_ICON_NAMES = [
  'hatha',
  'back',
  'singingBowl',
  'teens',
  'wheel',
  'sportBalance',
] as const

export type CourseIconName = (typeof COURSE_ICON_NAMES)[number]

/** Admin labels for the icon select field. */
export const COURSE_ICON_LABELS: Readonly<Record<CourseIconName, { de: string; en: string }>> = {
  hatha: { de: 'Hatha (Sonne und Mond)', en: 'Hatha (sun and moon)' },
  back: { de: 'Rücken (Wirbelsäule)', en: 'Back (spine)' },
  singingBowl: { de: 'Klangschale', en: 'Singing bowl' },
  teens: { de: 'Jugendliche (Spross)', en: 'Teens (sprout)' },
  wheel: { de: 'Yoga-Rad', en: 'Yoga wheel' },
  sportBalance: { de: 'Sport Balance (Steinturm)', en: 'Sport balance (stone stack)' },
}

export function isCourseIconName(value: unknown): value is CourseIconName {
  return typeof value === 'string' && (COURSE_ICON_NAMES as readonly string[]).includes(value)
}
