import type { CourseSummary } from '../types'

const DEFAULT_COUNT = 3

/**
 * "Weitere Kurse" under a course page: the courses nearest to it in the admin order, an earlier
 * one first on a tie, listed in admin order. Matches the design's picks for five of the six
 * courses without an extra admin field. A course missing from the list (a draft in preview)
 * gets the first courses instead.
 */
export function pickRelatedCourses(
  courses: readonly CourseSummary[],
  slug: string,
  count: number = DEFAULT_COUNT,
): CourseSummary[] {
  const current = courses.findIndex((course) => course.slug === slug)
  if (current === -1) return courses.slice(0, count)
  return courses
    .map((course, position) => ({ course, position, distance: Math.abs(position - current) }))
    .filter((entry) => entry.position !== current)
    .sort((a, b) => a.distance - b.distance || a.position - b.position)
    .slice(0, count)
    .sort((a, b) => a.position - b.position)
    .map((entry) => entry.course)
}
