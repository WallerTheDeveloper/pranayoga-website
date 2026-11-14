import type { MetadataRoute } from 'next'

import { getTechnicalSettings } from '@/content'
import { buildRobots } from '@/lib/seo'

/** /robots.txt: follows the admin's `noindex` switch. */
export default async function robots(): Promise<MetadataRoute.Robots> {
  const technical = await getTechnicalSettings()
  return buildRobots(technical.siteUrl, technical.noindex)
}
