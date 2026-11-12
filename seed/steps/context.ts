import type { Payload } from 'payload'

/**
 * Options shared by every seed write: the seed runs outside Next (no cache to revalidate) and as
 * the system, not as a visitor.
 */
export const SEED_WRITE = {
  overrideAccess: true,
  context: { disableRevalidate: true },
} as const

export interface SeedContext {
  payload: Payload
  /** Uploaded media by file name. */
  mediaIds: ReadonlyMap<string, number>
}

/** Media id for a seed file name; the manifest check guarantees it exists. */
export function mediaId(ctx: SeedContext, filename: string): number {
  const id = ctx.mediaIds.get(filename)
  if (id === undefined) throw new Error(`Image not uploaded: ${filename}`)
  return id
}

export function optionalMediaId(ctx: SeedContext, filename: string | undefined): number | null {
  return filename === undefined ? null : mediaId(ctx, filename)
}
