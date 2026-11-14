import type { MetadataRoute } from 'next'

import { routes } from './routes'

/** Every page with a fixed address, in the order a visitor would meet them. */
export const STATIC_PATHS: readonly string[] = [
  routes.home(),
  routes.courses(),
  routes.about(),
  routes.teacherTraining(),
  routes.pricing(),
  routes.signup(),
  routes.contact(),
  routes.legalNotice(),
  routes.privacyPolicy(),
]

/** Areas no search engine needs: the admin, the API and the preview routes. */
export const PRIVATE_PATHS: readonly string[] = ['/admin/', '/api/', '/next/']

/**
 * Absolute URLs of every public page: the fixed ones, then one per published course. Empty while
 * `noindex` is on, so the sitemap never lists pages that robots.txt tells crawlers to skip.
 */
export function buildSitemap(
  siteUrl: string,
  courseHrefs: readonly string[],
  noindex: boolean,
): MetadataRoute.Sitemap {
  if (noindex) return []
  return [...STATIC_PATHS, ...courseHrefs].map((path) => ({ url: `${siteUrl}${path}` }))
}

/**
 * With `noindex` on (staging, or before launch) nothing may be crawled. Otherwise everything but
 * the private areas, plus the sitemap's address.
 */
export function buildRobots(siteUrl: string, noindex: boolean): MetadataRoute.Robots {
  if (noindex) return { rules: { userAgent: '*', disallow: '/' } }
  return {
    rules: { userAgent: '*', allow: '/', disallow: [...PRIVATE_PATHS] },
    sitemap: `${siteUrl}/sitemap.xml`,
  }
}
