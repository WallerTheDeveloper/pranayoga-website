import { describe, expect, it } from 'vitest'

import { openGraphWithImage } from '@/lib/metadata'

import { imageData } from '../../fixtures/views'

describe('openGraphWithImage', () => {
  it('keeps the site-wide fields next to the page image', () => {
    expect(openGraphWithImage(imageData({ src: '/api/media/file/a.jpg', alt: 'A' }))).toEqual({
      siteName: 'Prana Yoga Studio Essen',
      locale: 'de_DE',
      type: 'website',
      images: [{ url: '/api/media/file/a.jpg', alt: 'A' }],
    })
  })

  it('leaves the layout default alone without an image', () => {
    expect(openGraphWithImage(null)).toBeUndefined()
  })
})
