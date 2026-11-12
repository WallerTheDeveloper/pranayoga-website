import type { PayloadRequest } from 'payload'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const revalidateTag = vi.hoisted(() => vi.fn())
vi.mock('next/cache', () => ({ revalidateTag }))

const {
  collectionCacheHooks,
  globalCacheHooks,
  isPublished,
  publicBeforeKey,
  rememberCollectionPublicState,
  rememberGlobalPublicState,
  revalidateCollectionAfterChange,
  revalidateCollectionAfterDelete,
  revalidateGlobalAfterChange,
} = await import('@/cache/hooks')
const { revalidateContent } = await import('@/cache/revalidate')

interface Doc {
  id: number
  slug?: string
  _status?: 'draft' | 'published' | null
}

function fakeReq(
  stored: { _status?: string } | null = null,
  context: Record<string, unknown> = {},
) {
  const logger = { error: vi.fn(), info: vi.fn() }
  const db = {
    findOne: vi.fn(async () => stored),
    findGlobal: vi.fn(async () => stored ?? {}),
  }
  return { req: { context, payload: { db, logger } } as unknown as PayloadRequest, db, logger }
}

const tags = (doc: Doc) => (doc.slug ? ['courses', `course:${doc.slug}`] : ['courses'])
const collection = { slug: 'courses' }

type ChangeHook = ReturnType<typeof revalidateCollectionAfterChange<Doc>>
type ChangeArgs = Parameters<ChangeHook>[0]

function changeArgs(req: PayloadRequest, doc: Doc, previousDoc?: Doc): ChangeArgs {
  return {
    collection,
    doc,
    previousDoc,
    req,
    operation: 'update',
    context: {},
  } as unknown as ChangeArgs
}

function expiredTags(): string[] {
  return revalidateTag.mock.calls.map(([tag]) => tag as string)
}

beforeEach(() => {
  revalidateTag.mockReset()
})

describe('revalidateContent', () => {
  it('expires each unique tag immediately', () => {
    const logger = { error: vi.fn(), info: vi.fn() }
    expect(revalidateContent(['a', 'b', 'a', ''], logger)).toEqual(['a', 'b'])
    expect(revalidateTag).toHaveBeenCalledWith('a', { expire: 0 })
    expect(revalidateTag).toHaveBeenCalledTimes(2)
    expect(logger.info).toHaveBeenCalledOnce()
  })

  it('logs and continues when a tag fails', () => {
    revalidateTag.mockImplementationOnce(() => {
      throw new Error('no store')
    })
    const logger = { error: vi.fn() }
    expect(revalidateContent(['a', 'b'], logger)).toEqual(['a', 'b'])
    expect(logger.error).toHaveBeenCalledWith(expect.stringContaining('no store'))
    expect(revalidateTag).toHaveBeenCalledTimes(2)
  })

  it('does nothing for no tags', () => {
    expect(revalidateContent([])).toEqual([])
    expect(revalidateTag).not.toHaveBeenCalled()
  })
})

describe('collection afterChange', () => {
  const hook = revalidateCollectionAfterChange<Doc>({ drafts: true, tags })

  it('clears tags on publish, including the previous slug', async () => {
    const { req } = fakeReq()
    await hook(
      changeArgs(
        req,
        { id: 1, slug: 'neu', _status: 'published' },
        { id: 1, slug: 'alt', _status: 'published' },
      ),
    )
    expect(expiredTags()).toEqual(['courses', 'course:neu', 'course:alt'])
  })

  it('ignores draft saves on a draft-only document', async () => {
    const { req, db } = fakeReq()
    await hook(changeArgs(req, { id: 1, _status: 'draft' }, { id: 1, _status: 'draft' }))
    expect(revalidateTag).not.toHaveBeenCalled()
    expect(db.findOne).not.toHaveBeenCalled()
  })

  it('ignores a draft saved over the published version', async () => {
    const { req } = fakeReq({ _status: 'published' }, { [publicBeforeKey('courses', 1)]: true })
    await hook(changeArgs(req, { id: 1, _status: 'draft' }, { id: 1, _status: 'published' }))
    expect(revalidateTag).not.toHaveBeenCalled()
  })

  it('clears tags on unpublish, even when the latest version was a draft', async () => {
    const { req } = fakeReq({ _status: 'draft' }, { [publicBeforeKey('courses', 1)]: true })
    await hook(
      changeArgs(
        req,
        { id: 1, slug: 'x', _status: 'draft' },
        { id: 1, slug: 'x', _status: 'draft' },
      ),
    )
    expect(expiredTags()).toEqual(['courses', 'course:x'])
  })

  it('ignores a draft result when the document was not public before', async () => {
    const { req, db } = fakeReq({ _status: 'draft' }, { [publicBeforeKey('courses', 1)]: false })
    await hook(changeArgs(req, { id: 1, _status: 'draft' }, { id: 1, _status: 'published' }))
    expect(revalidateTag).not.toHaveBeenCalled()
    expect(db.findOne).not.toHaveBeenCalled()
  })

  it('clears tags on unpublish', async () => {
    const { req } = fakeReq({ _status: 'draft' }, { [publicBeforeKey('courses', 1)]: true })
    await hook(
      changeArgs(
        req,
        { id: 1, slug: 'x', _status: 'draft' },
        { id: 1, slug: 'x', _status: 'published' },
      ),
    )
    expect(expiredTags()).toEqual(['courses', 'course:x'])
  })

  it('skips everything when the seed disables revalidation', async () => {
    const { req } = fakeReq(null, { disableRevalidate: true })
    await hook(changeArgs(req, { id: 1, _status: 'published' }))
    expect(revalidateTag).not.toHaveBeenCalled()
  })

  it('always clears for collections without drafts', async () => {
    const plain = revalidateCollectionAfterChange<Doc>({ drafts: false, tags: () => ['media'] })
    const { req } = fakeReq()
    await plain(changeArgs(req, { id: 1 }))
    expect(expiredTags()).toEqual(['media'])
  })
})

describe('collection afterDelete', () => {
  type DeleteArgs = Parameters<ReturnType<typeof revalidateCollectionAfterDelete<Doc>>>[0]
  const args = (req: PayloadRequest, doc: Doc) =>
    ({ doc, req, id: doc.id }) as unknown as DeleteArgs

  it('clears tags only when a published document goes away', async () => {
    const hook = revalidateCollectionAfterDelete<Doc>({ drafts: true, tags })
    const { req } = fakeReq()
    await hook(args(req, { id: 1, _status: 'draft' }))
    expect(revalidateTag).not.toHaveBeenCalled()
    await hook(args(req, { id: 1, slug: 'x', _status: 'published' }))
    expect(expiredTags()).toEqual(['courses', 'course:x'])
  })

  it('respects disableRevalidate and no-draft collections', async () => {
    const plain = revalidateCollectionAfterDelete<Doc>({ drafts: false, tags: () => ['media'] })
    await plain(args(fakeReq(null, { disableRevalidate: true }).req, { id: 1 }))
    expect(revalidateTag).not.toHaveBeenCalled()
    await plain(args(fakeReq().req, { id: 1 }))
    expect(expiredTags()).toEqual(['media'])
  })
})

describe('global afterChange', () => {
  type GlobalArgs = Parameters<ReturnType<typeof revalidateGlobalAfterChange>>[0]
  const args = (req: PayloadRequest, doc: object, previousDoc?: object) =>
    ({ doc, previousDoc, req, global: { slug: 'business-settings' } }) as unknown as GlobalArgs

  it('clears on publish and unpublish, not on draft saves', async () => {
    const hook = revalidateGlobalAfterChange({ drafts: true, tags: ['business-settings'] })
    await hook(args(fakeReq().req, { _status: 'published' }))
    expect(expiredTags()).toEqual(['business-settings'])

    revalidateTag.mockReset()
    const wasPublic = { [publicBeforeKey('business-settings')]: true }
    await hook(args(fakeReq({ _status: 'published' }, { ...wasPublic }).req, { _status: 'draft' }))
    expect(revalidateTag).not.toHaveBeenCalled()

    await hook(args(fakeReq({ _status: 'draft' }, { ...wasPublic }).req, { _status: 'draft' }))
    expect(expiredTags()).toEqual(['business-settings'])

    revalidateTag.mockReset()
    await hook(args(fakeReq().req, { _status: 'draft' }))
    expect(revalidateTag).not.toHaveBeenCalled()
  })

  it('handles globals without drafts and disabled revalidation', async () => {
    const hook = revalidateGlobalAfterChange({ drafts: false, tags: ['legal-notice'] })
    await hook(args(fakeReq(null, { disableRevalidate: true }).req, {}))
    expect(revalidateTag).not.toHaveBeenCalled()
    await hook(args(fakeReq().req, {}))
    expect(expiredTags()).toEqual(['legal-notice'])
  })
})

describe('beforeChange: remembering the public state', () => {
  type CollectionArgs = Parameters<ReturnType<typeof rememberCollectionPublicState>>[0]
  type GlobalArgs = Parameters<ReturnType<typeof rememberGlobalPublicState>>[0]
  const collectionArgs = (req: PayloadRequest, data: object, extra: object = {}) =>
    ({
      collection,
      data,
      operation: 'update',
      originalDoc: { id: 7 },
      req,
      ...extra,
    }) as unknown as CollectionArgs
  const globalArgs = (req: PayloadRequest, data: object) =>
    ({ data, global: { slug: 'business-settings' }, req }) as unknown as GlobalArgs

  it('stores whether the main document was published before an update', async () => {
    const hook = rememberCollectionPublicState()
    const { req, db } = fakeReq({ _status: 'published' })
    const data = { _status: 'draft' }
    expect(await hook(collectionArgs(req, data))).toBe(data)
    expect(db.findOne).toHaveBeenCalledOnce()
    expect(req.context[publicBeforeKey('courses', 7)]).toBe(true)

    const unpublished = fakeReq({ _status: 'draft' })
    await hook(collectionArgs(unpublished.req, { _status: 'draft' }))
    expect(unpublished.req.context[publicBeforeKey('courses', 7)]).toBe(false)
  })

  it('skips the lookup for creates, publishes and the seed', async () => {
    const hook = rememberCollectionPublicState()
    for (const [data, extra, context] of [
      [{ _status: 'draft' }, { operation: 'create', originalDoc: undefined }, {}],
      [{ _status: 'published' }, {}, {}],
      [{ _status: 'draft' }, {}, { disableRevalidate: true }],
    ] as const) {
      const { req, db } = fakeReq({ _status: 'published' }, { ...context })
      await hook(collectionArgs(req, data, extra))
      expect(db.findOne).not.toHaveBeenCalled()
    }
  })

  it('does the same for globals', async () => {
    const hook = rememberGlobalPublicState()
    const { req, db } = fakeReq({ _status: 'published' })
    await hook(globalArgs(req, { _status: 'draft' }))
    expect(db.findGlobal).toHaveBeenCalledOnce()
    expect(req.context[publicBeforeKey('business-settings')]).toBe(true)

    const publish = fakeReq({ _status: 'draft' })
    await hook(globalArgs(publish.req, { _status: 'published' }))
    expect(publish.db.findGlobal).not.toHaveBeenCalled()
  })
})

describe('hook factories', () => {
  it('wire beforeChange only for drafts', () => {
    const drafted = collectionCacheHooks<Doc>({ drafts: true, tags })
    expect(drafted.beforeChange).toHaveLength(1)
    expect(drafted.afterChange).toHaveLength(1)
    expect(drafted.afterDelete).toHaveLength(1)
    expect(collectionCacheHooks<Doc>({ drafts: false, tags }).beforeChange).toEqual([])
    expect(globalCacheHooks({ drafts: true, tags: ['x'] }).beforeChange).toHaveLength(1)
    expect(globalCacheHooks({ drafts: false, tags: ['x'] }).beforeChange).toEqual([])
  })
})

describe('isPublished', () => {
  it('reads the status safely', () => {
    expect(isPublished({ _status: 'published' })).toBe(true)
    expect(isPublished({ _status: 'draft' })).toBe(false)
    expect(isPublished(null)).toBe(false)
  })
})
