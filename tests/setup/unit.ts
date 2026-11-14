import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { createElement, type ImgHTMLAttributes } from 'react'
import { afterEach, vi } from 'vitest'

// next.config sets `trailingSlash: true`; Next passes it to next/link through this variable.
process.env.__NEXT_TRAILING_SLASH = 'true'

/**
 * next/image needs the Next image config at runtime; in jsdom a plain <img> with the same src,
 * alt and sizes is enough to test what the components pass to it.
 */
vi.mock('next/image', () => ({
  default: ({
    fill,
    preload,
    unoptimized,
    ...props
  }: ImgHTMLAttributes<HTMLImageElement> & {
    fill?: boolean
    preload?: boolean
    unoptimized?: boolean
  }) =>
    createElement('img', {
      ...props,
      'data-fill': fill ? '' : undefined,
      'data-preload': preload ? '' : undefined,
      'data-unoptimized': unoptimized ? '' : undefined,
    }),
}))

// jsdom does no layout: scrolling is a no-op the components may call.
Element.prototype.scrollIntoView ??= function scrollIntoView() {}

afterEach(() => {
  cleanup()
})
