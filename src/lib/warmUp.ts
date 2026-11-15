import { isValidSlug, routes, type RouteKey } from './routes'

/**
 * Every public URL the warm-up requests after a container start, so the first visitor gets a
 * cached page. Built from the route table and the published courses, not from the sitemap,
 * which stays empty while `noindex` is on. Keep this file free of Next/Payload imports.
 */

type StaticRouteKey = Exclude<RouteKey, 'course'>

const STATIC_ROUTE_KEYS: readonly StaticRouteKey[] = [
  'home',
  'courses',
  'pricing',
  'signup',
  'about',
  'teacherTraining',
  'contact',
  'legalNotice',
  'privacyPolicy',
]

const METADATA_PATHS = ['/robots.txt', '/sitemap.xml'] as const

/** The fixed pages, then one page per course, then robots and sitemap. No duplicates. */
export function warmUpPaths(courseSlugs: readonly string[]): string[] {
  const pages = STATIC_ROUTE_KEYS.map((key) => routes[key]())
  const coursePages = courseSlugs.filter(isValidSlug).map((slug) => routes.course(slug))
  return [...new Set([...pages, ...coursePages, ...METADATA_PATHS])]
}
