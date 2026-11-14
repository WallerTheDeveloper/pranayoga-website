import { isDownloadUsage, type DownloadUsage } from '@/lib/downloads'
import type { Download } from '@/payload-types'

import type { DownloadView } from '../types'
import { DOWNLOAD_FILE_PATH, localUploadPath, withVersion } from './media'
import { cleanText } from './values'

export type DownloadsByUsage = Readonly<Record<DownloadUsage, DownloadView | null>>

/** A download with a title and a servable file; null otherwise, so its button stays hidden. */
export function toDownload(doc: Download): DownloadView | null {
  const title = cleanText(doc.title)
  const path = localUploadPath(doc.url, DOWNLOAD_FILE_PATH)
  if (!title || !path) return null
  return { title, href: withVersion(path, doc.updatedAt) }
}

/** One file per usage (the admin enforces that); files without a usage are not linked. */
export function downloadsByUsage(docs: readonly Download[]): DownloadsByUsage {
  const result: Record<DownloadUsage, DownloadView | null> = {
    'membership-contract': null,
    'teacher-training-flyer': null,
  }
  for (const doc of docs) {
    if (!isDownloadUsage(doc.usage) || result[doc.usage]) continue
    result[doc.usage] = toDownload(doc)
  }
  return result
}
