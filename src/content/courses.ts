import { CACHE_TAGS, courseTag } from '@/cache/tags'
import { isValidSlug } from '@/lib/routes'

import { toCourseDetail, toCourseSummary } from './mappers/courses'
import { isPresent } from './mappers/values'
import { getTrialOffer } from './prices'
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

/** One course page, or null for an unknown or unpublished slug. */
export async function getCourse(slug: string): Promise<CourseDetail | null> {
  if (!isValidSlug(slug)) return null
  const trial = await getTrialOffer()
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
      return doc ? toCourseDetail(doc, { trialPriceLabel: trial?.priceLabel ?? null }) : null
    },
  })
}
