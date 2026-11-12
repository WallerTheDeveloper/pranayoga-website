import { Atkinson_Hyperlegible_Next, Fraunces } from 'next/font/google'

/**
 * Self-hosted at build time by next/font: visitors never request Google's servers.
 * Fraunces keeps its SOFT/WONK/opsz axes for `font-variation-settings` in tokens.css.
 */
export const fraunces = Fraunces({
  subsets: ['latin', 'latin-ext'],
  style: ['normal', 'italic'],
  axes: ['SOFT', 'WONK', 'opsz'],
  display: 'swap',
  variable: '--font-fraunces',
})

export const atkinson = Atkinson_Hyperlegible_Next({
  subsets: ['latin', 'latin-ext'],
  style: ['normal', 'italic'],
  display: 'swap',
  variable: '--font-atkinson',
})
