import { revalidateTag } from 'next/cache'

export interface RevalidateLogger {
  error: (message: string) => void
  info?: (message: string) => void
}

/**
 * Expires every tag immediately (no stale-while-revalidate), so no visitor sees the old version
 * after a publish. Duplicates and empty tags are dropped.
 */
export function revalidateContent(tags: readonly string[], logger?: RevalidateLogger): string[] {
  const unique = [...new Set(tags.filter((tag) => tag.length > 0))]
  for (const tag of unique) {
    try {
      revalidateTag(tag, { expire: 0 })
    } catch (error) {
      const reason = error instanceof Error ? error.message : String(error)
      logger?.error(`Cache revalidation failed for tag "${tag}": ${reason}`)
    }
  }
  if (unique.length > 0) logger?.info?.(`Revalidated cache tags: ${unique.join(', ')}`)
  return unique
}
