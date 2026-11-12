import { CACHE_TAGS, courseTag } from '@/cache/tags'
import { isValidSlug } from '@/lib/routes'

import { toCourseDetail, toCourseSummary } from './mappers/courses'
import { coursePriceLines, findTrialOffer } from './mappers/prices'
import { pickRelatedCourses } from './mappers/related'
import { isPresent } from './mappers/values'
import { getPriceGroups } from './prices'
import { READ_OPTIONS, getPayloadClient, readContent } from './source'
import type { CourseDetail, CourseSummary } from './types'

/** Every course, in admin order, for the grid, the header dropdown and the footer. */
export function getCourses(): Promise<CourseSummary[]> {
  return readContent({
    key: ['courses'],
    tags: [CACHE_TAGS.courses, CACHE_TAGS.media],
    load: async (mode) => {
      const payload = await getPayloadClient()
      const result = await payload.find({
        collection: 'courses',
        ...READ_OPTIONS[mode],
        depth: 1,
        sort: 'order',
        limit: 50,
        pagination: false,
      })
      return result.docs.map(toCourseSummary).filter(isPresent)
    },
  })
}

/**
 * Whether a course page exists for the slug. Checked against the cached course list first, so an
 * unknown URL never creates a cache entry of its own (each would live until the next publish).
 */
async function isListedCourse(slug: string): Promise<boolean> {
  if (!isValidSlug(slug)) return false
  const courses = await getCourses()
  return courses.some((course) => course.slug === slug)
}

/** One course page, or null for an unknown or unpublished slug. */
export async function getCourse(slug: string): Promise<CourseDetail | null> {
  if (!(await isListedCourse(slug))) return null
  const groups = await getPriceGroups()
  const context = {
    trialPriceLabel: findTrialOffer(groups)?.priceLabel ?? null,
    priceLines: coursePriceLines(groups),
  }
  // `context` comes from the price groups but is not part of the key: the price-groups tag is
  // what clears this entry when a price changes, so keep it in the tags.
  return readContent({
    key: ['course', slug],
    tags: [courseTag(slug), CACHE_TAGS.priceGroups, CACHE_TAGS.media],
    load: async (mode) => {
      const payload = await getPayloadClient()
      const result = await payload.find({
        collection: 'courses',
        ...READ_OPTIONS[mode],
        where: { slug: { equals: slug } },
        depth: 1,
        limit: 1,
        pagination: false,
      })
      const doc = result.docs[0]
      return doc ? toCourseDetail(doc, context) : null
    },
  })
}

/** "Weitere Kurse" for a course page; see `pickRelatedCourses`. */
export async function getRelatedCourses(slug: string): Promise<CourseSummary[]> {
  return pickRelatedCourses(await getCourses(), slug)
}
