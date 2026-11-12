import { CACHE_TAGS } from '@/cache/tags'

import { COPY_MEDIA, COPY_MEDIA_KEYS, type CopyMediaKey } from './copy/mediaRefs'
import { toImage } from './mappers/media'
import { getPayloadClient, readContent } from './source'
import type { ImageData } from './types'

export type CopyImages = Readonly<Record<CopyMediaKey, ImageData | null>>

/**
 * Images the copy modules reference by file name. Media has no drafts, so both read modes see the
 * same documents; a missing file yields null and the component shows its placeholder.
 */
export function getCopyImages(): Promise<CopyImages> {
  return readContent({
    key: ['copy-images'],
    tags: [CACHE_TAGS.media],
    load: async () => {
      const payload = await getPayloadClient()
      const filenames = COPY_MEDIA_KEYS.map((key) => COPY_MEDIA[key].filename)
      const result = await payload.find({
        collection: 'media',
        where: { filename: { in: filenames } },
        overrideAccess: false,
        depth: 0,
        limit: filenames.length,
        pagination: false,
      })
      const byFilename = new Map(result.docs.map((doc) => [doc.filename, doc]))
      return Object.fromEntries(
        COPY_MEDIA_KEYS.map((key) => {
          const ref = COPY_MEDIA[key]
          return [key, toImage(byFilename.get(ref.filename), ref.tier)]
        }),
      ) as Record<CopyMediaKey, ImageData | null>
    },
  })
}
