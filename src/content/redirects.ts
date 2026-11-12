import { CACHE_TAGS } from '@/cache/tags'
import { isValidSlug, routes } from '@/lib/routes'
import { isSafeRedirectTarget, normalizeRedirectSource } from '@/lib/validation/url'
import type { Redirect } from '@/payload-types'

import { getPayloadClient, readContent } from './source'

/** Resolves where a stored redirect points; null for a broken or unsafe target. */
export function redirectTarget(doc: Pick<Redirect, 'to'>): string | null {
  const to = doc.to
  if (to?.type === 'reference') {
    const value = to.reference?.value
    const slug = typeof value === 'object' && value !== null ? value.slug : null
    return typeof slug === 'string' && isValidSlug(slug) ? routes.course(slug) : null
  }
  const url = typeof to?.url === 'string' ? to.url.trim() : ''
  return url && isSafeRedirectTarget(url) ? url : null
}

/**
 * Where an old URL now lives (WordPress 301s), or null. Used by the course page for unknown slugs.
 * Redirects are admin-only in the API, so this server-side lookup overrides access.
 */
export async function findRedirect(path: string): Promise<string | null> {
  const from = normalizeRedirectSource(path)
  if (!from) return null
  const map = await readContent({
    key: ['redirects'],
    tags: [CACHE_TAGS.redirects, CACHE_TAGS.courses],
    load: async () => {
      const payload = await getPayloadClient()
      const result = await payload.find({
        collection: 'redirects',
        overrideAccess: true,
        depth: 1,
        limit: 500,
        pagination: false,
      })
      return Object.fromEntries(
        result.docs.flatMap((doc) => {
          const target = redirectTarget(doc)
          return target ? [[doc.from, target] as const] : []
        }),
      )
    },
  })
  return map[from] ?? null
}
