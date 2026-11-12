import config from '@payload-config'
import { unstable_cache } from 'next/cache'
import { draftMode, headers } from 'next/headers'
import { getPayload, type Payload } from 'payload'

/**
 * Where content comes from. Visitors get published documents from the tagged cache; an editor in
 * Draft Mode (set by /next/preview) gets drafts straight from the database, uncached.
 */

export function getPayloadClient(): Promise<Payload> {
  return getPayload({ config })
}

export type ReadMode = 'published' | 'draft'

/** Payload read options for each mode. Published reads run as an anonymous visitor. */
export const READ_OPTIONS = {
  published: { draft: false, overrideAccess: false },
  draft: { draft: true, overrideAccess: true },
} as const satisfies Record<ReadMode, { draft: boolean; overrideAccess: boolean }>

/**
 * Draft Mode alone is not enough to see drafts: the request must also carry a valid admin session.
 * `headers()` is only reached in Draft Mode, so public pages stay static.
 */
export async function getReadMode(): Promise<ReadMode> {
  const { isEnabled } = await draftMode()
  if (!isEnabled) return 'published'
  const payload = await getPayloadClient()
  const { user } = await payload.auth({ headers: await headers() })
  return user ? 'draft' : 'published'
}

interface ContentQuery<T> {
  /** Unique cache key parts, e.g. `['course', slug]`. */
  key: readonly string[]
  /** Cleared by the Payload hooks (src/cache/hooks.ts). */
  tags: readonly string[]
  load: (mode: ReadMode) => Promise<T>
}

/**
 * Runs a content query in the current read mode. Published results are cached with no time-based
 * expiry; only the admin hooks clear them.
 */
export async function readContent<T>({ key, tags, load }: ContentQuery<T>): Promise<T> {
  const mode = await getReadMode()
  if (mode === 'draft') return load('draft')
  return unstable_cache(() => load('published'), ['content', ...key], {
    tags: [...tags],
    revalidate: false,
  })()
}
