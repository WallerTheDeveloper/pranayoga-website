/** Where a PDF from the downloads collection appears. Plain data for the config and the pages. */
export const DOWNLOAD_USAGES = ['membership-contract', 'teacher-training-flyer'] as const

export type DownloadUsage = (typeof DOWNLOAD_USAGES)[number]

export function isDownloadUsage(value: unknown): value is DownloadUsage {
  return typeof value === 'string' && (DOWNLOAD_USAGES as readonly string[]).includes(value)
}
