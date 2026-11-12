import type { Metadata } from 'next'

import { sharedCopy } from '@/content/copy/shared'
import type { ImageData } from '@/content/types'

/**
 * Open Graph for a page with its own share image. Next merges metadata shallowly, so a page that
 * sets `openGraph` replaces the layout's object whole: repeat the site-wide fields here.
 */
export function openGraphWithImage(image: ImageData | null): Metadata['openGraph'] {
  if (!image) return undefined
  return {
    siteName: sharedCopy.brand.name,
    locale: 'de_DE',
    type: 'website',
    images: [{ url: image.src, alt: image.alt }],
  }
}
