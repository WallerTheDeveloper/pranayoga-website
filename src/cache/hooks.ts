import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  CollectionBeforeChangeHook,
  CollectionSlug,
  GlobalAfterChangeHook,
  GlobalBeforeChangeHook,
  GlobalSlug,
  PayloadRequest,
  TypeWithID,
} from 'payload'

import { revalidateContent } from './revalidate'

/**
 * Payload hooks that clear the cache when the public version of a document changes:
 * publish, unpublish, delete. Draft saves and autosaves leave the cache alone.
 * Seed scripts and migrations set `context.disableRevalidate`, since they run outside Next.
 *
 * The hooks run inside Payload's transaction, before the commit. That is safe in Next: inside a
 * route handler or server action, `revalidateTag` only queues the tag, and Next applies the
 * queue once the handler has returned, after the commit.
 *
 * Unpublish detection: Payload passes the latest *version* as `previousDoc`, which is a draft
 * whenever the editor saved one on top of the published document. Only the stored main
 * document says what visitors see, so `beforeChange` reads it before the write and leaves the
 * answer in `req.context` for `afterChange`. Use the `*CacheHooks` factories, which wire both.
 */

interface StatusDoc extends TypeWithID {
  _status?: 'draft' | 'published' | null
}

type TagBuilder<T> = (doc: T) => readonly string[]

/** Globals have no id. */
type GlobalStatusDoc = Pick<StatusDoc, '_status'>

export function isPublished(doc: GlobalStatusDoc | null | undefined): boolean {
  return doc?._status === 'published'
}

function revalidationDisabled(req: PayloadRequest): boolean {
  return req.context?.disableRevalidate === true
}

/** Where `beforeChange` leaves whether the stored main document was published. */
export function publicBeforeKey(target: string, id?: number | string): string {
  return id === undefined ? `cache:publicBefore:${target}` : `cache:publicBefore:${target}:${id}`
}

function wasPublicBefore(req: PayloadRequest, key: string): boolean {
  return req.context?.[key] === true
}

function rememberPublicState(req: PayloadRequest, key: string, published: boolean): void {
  // req.context is Payload's shared, mutable channel between the hooks of one operation; it's
  // written in place (not replaced), so every holder of the object sees the value.
  req.context[key] = published
}

/** Records whether the stored main document is published, before an update overwrites it. */
export function rememberCollectionPublicState(): CollectionBeforeChangeHook {
  return async ({ collection, data, operation, originalDoc, req }) => {
    if (revalidationDisabled(req) || operation !== 'update' || originalDoc?.id === undefined) {
      return data
    }
    // A publish clears the cache whatever came before, so it needs no lookup.
    if (data?._status === 'published') return data
    const main = await req.payload.db.findOne<StatusDoc>({
      collection: collection.slug,
      req,
      where: { id: { equals: originalDoc.id } },
    })
    rememberPublicState(req, publicBeforeKey(collection.slug, originalDoc.id), isPublished(main))
    return data
  }
}

export function rememberGlobalPublicState(): GlobalBeforeChangeHook {
  return async ({ data, global, req }) => {
    if (revalidationDisabled(req) || data?._status === 'published') return data
    const main = await req.payload.db.findGlobal<GlobalStatusDoc & Record<string, unknown>>({
      slug: global.slug as GlobalSlug,
      req,
    })
    rememberPublicState(req, publicBeforeKey(global.slug), isPublished(main))
    return data
  }
}

/**
 * A draft result is an unpublish only when the main document was published before and isn't
 * now; a draft saved on top of the published version leaves the main document published.
 */
async function collectionPublicVersionChanged(
  req: PayloadRequest,
  collection: CollectionSlug,
  doc: StatusDoc,
): Promise<boolean> {
  if (isPublished(doc)) return true
  if (!wasPublicBefore(req, publicBeforeKey(collection, doc.id))) return false
  const main = await req.payload.db.findOne<StatusDoc>({
    collection,
    req,
    where: { id: { equals: doc.id } },
  })
  return !isPublished(main)
}

async function globalPublicVersionChanged(
  req: PayloadRequest,
  slug: GlobalSlug,
  doc: GlobalStatusDoc,
): Promise<boolean> {
  if (isPublished(doc)) return true
  if (!wasPublicBefore(req, publicBeforeKey(slug))) return false
  const main = await req.payload.db.findGlobal<GlobalStatusDoc & Record<string, unknown>>({
    slug,
    req,
  })
  return !isPublished(main)
}

interface CollectionHookOptions<T> {
  /** Whether the collection uses drafts; without drafts every change is public. */
  drafts: boolean
  tags: TagBuilder<T>
}

export function revalidateCollectionAfterChange<T extends StatusDoc>({
  drafts,
  tags,
}: CollectionHookOptions<T>): CollectionAfterChangeHook<T> {
  return async ({ collection, doc, previousDoc, req }) => {
    if (revalidationDisabled(req)) return doc
    const changed = drafts ? await collectionPublicVersionChanged(req, collection.slug, doc) : true
    if (changed) {
      // The previous version still carries the old slug when a slug changes.
      const previousTags = previousDoc ? tags(previousDoc) : []
      revalidateContent([...tags(doc), ...previousTags], req.payload.logger)
    }
    return doc
  }
}

export function revalidateCollectionAfterDelete<T extends StatusDoc>({
  drafts,
  tags,
}: CollectionHookOptions<T>): CollectionAfterDeleteHook<T> {
  return ({ doc, req }) => {
    if (revalidationDisabled(req)) return doc
    if (!drafts || isPublished(doc)) {
      revalidateContent(tags(doc), req.payload.logger)
    }
    return doc
  }
}

interface GlobalHookOptions {
  drafts: boolean
  tags: readonly string[]
}

export function revalidateGlobalAfterChange(options: GlobalHookOptions): GlobalAfterChangeHook {
  return async ({ doc, global, req }) => {
    if (revalidationDisabled(req)) return doc
    const changed = options.drafts
      ? await globalPublicVersionChanged(req, global.slug as GlobalSlug, doc as GlobalStatusDoc)
      : true
    if (changed) revalidateContent(options.tags, req.payload.logger)
    return doc
  }
}

interface CollectionCacheHooks<T extends TypeWithID> {
  beforeChange: CollectionBeforeChangeHook[]
  afterChange: CollectionAfterChangeHook<T>[]
  afterDelete: CollectionAfterDeleteHook<T>[]
}

/** All cache hooks of a collection, so `beforeChange` and `afterChange` can't drift apart. */
export function collectionCacheHooks<T extends StatusDoc>(
  options: CollectionHookOptions<T>,
): CollectionCacheHooks<T> {
  return {
    beforeChange: options.drafts ? [rememberCollectionPublicState()] : [],
    afterChange: [revalidateCollectionAfterChange<T>(options)],
    afterDelete: [revalidateCollectionAfterDelete<T>(options)],
  }
}

export function globalCacheHooks(options: GlobalHookOptions): {
  beforeChange: GlobalBeforeChangeHook[]
  afterChange: GlobalAfterChangeHook[]
} {
  return {
    beforeChange: options.drafts ? [rememberGlobalPublicState()] : [],
    afterChange: [revalidateGlobalAfterChange(options)],
  }
}
