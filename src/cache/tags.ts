/**
 * Cache tags: one per collection or global, plus one per course (docs/PLAN.md "Caching").
 * Plain data so both the content layer and the Payload hooks can import it.
 */
export const CACHE_TAGS = {
  businessSettings: 'business-settings',
  technicalSettings: 'technical-settings',
  courses: 'courses',
  priceGroups: 'price-groups',
  reviews: 'reviews',
  teacherTraining: 'teacher-training',
  downloads: 'downloads',
  legalNotice: 'legal-notice',
  privacyPolicy: 'privacy-policy',
  redirects: 'redirects',
  media: 'media',
} as const

export type CacheTag = (typeof CACHE_TAGS)[keyof typeof CACHE_TAGS]

export function courseTag(slug: string): string {
  return `course:${slug}`
}
