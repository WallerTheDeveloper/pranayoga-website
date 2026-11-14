import type { MetadataRoute } from 'next'

import { getCourses, getTechnicalSettings } from '@/content'
import { buildSitemap } from '@/lib/seo'

/** /sitemap.xml: refreshed with the courses and settings it reads (cache tags). */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [technical, courses] = await Promise.all([getTechnicalSettings(), getCourses()])
  return buildSitemap(
    technical.siteUrl,
    courses.map((course) => course.href),
    technical.noindex,
  )
}
