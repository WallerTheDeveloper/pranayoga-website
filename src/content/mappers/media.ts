import type { ImageTier } from '@/lib/validation/imageTier'
import type { Media } from '@/payload-types'

import type { ImageData } from '../types'
import { cleanText } from './values'

/** Payload serves uploads under these paths; next.config allows the media one for next/image. */
export const MEDIA_FILE_PATH = '/api/media/file/'
export const DOWNLOAD_FILE_PATH = '/api/downloads/file/'

/** Placeholder origin for parsing relative paths; never requested. */
const RELATIVE_BASE = 'http://relative.invalid'

/**
 * Reduces an upload URL to a same-site path below `basePath`. Payload makes URLs absolute when
 * `serverURL` is set; next/image only accepts the local path. Anything else is rejected.
 *
 * Inside Next, `withPayload` turns on Payload's trailing-slash mode, so file URLs come back as
 * `/api/media/file/x.jpg/`. Next answers that with a 308 to `x.jpg`, which the image optimizer
 * does not follow, so the slash after the file name is removed here.
 */
export function localUploadPath(url: string | null | undefined, basePath: string): string | null {
  if (!url) return null
  let parsed: URL
  try {
    // Relative paths resolve against a placeholder origin; URL parsing also resolves `..`.
    parsed = new URL(url, RELATIVE_BASE)
  } catch {
    return null
  }
  if (!url.startsWith('/') && parsed.origin === RELATIVE_BASE) return null
  const file = parsed.pathname.replace(/\/+$/, '')
  if (!file.startsWith(basePath) || file.length === basePath.length) return null
  return `${file}${parsed.search}`
}

export function localMediaPath(url: string | null | undefined): string | null {
  return localUploadPath(url, MEDIA_FILE_PATH)
}

/** Adds `?v=<updatedAt>` so a replaced file is never served from a stale cache. */
export function withVersion(path: string, updatedAt: string | null | undefined): string {
  const stamp = updatedAt ? Date.parse(updatedAt) : Number.NaN
  if (!Number.isFinite(stamp)) return path
  return `${path}${path.includes('?') ? '&' : '?'}v=${stamp}`
}

function focalPosition(media: Pick<Media, 'focalX' | 'focalY'>): string {
  const x = typeof media.focalX === 'number' ? media.focalX : 50
  const y = typeof media.focalY === 'number' ? media.focalY : 50
  return `${x}% ${y}%`
}

function isMediaDoc(value: unknown): value is Media {
  return typeof value === 'object' && value !== null && 'id' in value && 'alt' in value
}

/**
 * The tier's generated size when available, else the original. Unpopulated relations (plain ids)
 * and files without dimensions yield null, so the component renders its placeholder instead.
 */
export function toImage(value: unknown, tier: ImageTier): ImageData | null {
  if (!isMediaDoc(value)) return null
  const size = value.sizes?.[tier]
  const source =
    size?.url && size.width && size.height
      ? { url: size.url, width: size.width, height: size.height }
      : value.url && value.width && value.height
        ? { url: value.url, width: value.width, height: value.height }
        : null
  const path = localMediaPath(source?.url)
  if (!source || !path) return null
  return {
    src: withVersion(path, value.updatedAt),
    alt: cleanText(value.alt) ?? '',
    width: source.width,
    height: source.height,
    objectPosition: focalPosition(value),
  }
}

/** The original upload (not a tier size), e.g. for "open in full size" links. */
export function originalImageHref(value: unknown): string | null {
  if (!isMediaDoc(value)) return null
  const path = localMediaPath(value.url)
  return path ? withVersion(path, value.updatedAt) : null
}
