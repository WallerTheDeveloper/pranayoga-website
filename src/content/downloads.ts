import { CACHE_TAGS } from '@/cache/tags'
import { DOWNLOAD_USAGES } from '@/lib/downloads'

import { downloadsByUsage, type DownloadsByUsage } from './mappers/downloads'
import { getPayloadClient, readContent } from './source'

/**
 * The PDF behind each download button. Downloads have no drafts, so both read modes see the same
 * files; a usage without a file yields null and its button stays hidden.
 */
export function getDownloads(): Promise<DownloadsByUsage> {
  return readContent({
    key: ['downloads'],
    tags: [CACHE_TAGS.downloads],
    load: async () => {
      const payload = await getPayloadClient()
      const result = await payload.find({
        collection: 'downloads',
        where: { usage: { in: [...DOWNLOAD_USAGES] } },
        overrideAccess: false,
        depth: 0,
        limit: DOWNLOAD_USAGES.length,
        pagination: false,
      })
      return downloadsByUsage(result.docs)
    },
  })
}
