import { describe, expect, it } from 'vitest'

import {
  absoluteUrl,
  buildRedirects,
  buildRewrites,
  isValidSlug,
  routeTable,
  routes,
} from '@/lib/routes'

describe('routes', () => {
  it('builds German public hrefs with trailing slashes', () => {
    expect(routes.home()).toBe('/')
    expect(routes.courses()).toBe('/kurse/')
    expect(routes.course('hatha-yoga')).toBe('/kurse/hatha-yoga/')
    expect(routes.pricing()).toBe('/mitgliedschaft-preise/')
    expect(routes.signup()).toBe('/anmeldeformular/')
    expect(routes.about()).toBe('/ueber-uns/')
    expect(routes.teacherTraining()).toBe('/yogaausbildungen/')
    expect(routes.contact()).toBe('/kontakt/')
    expect(routes.legalNotice()).toBe('/impressum/')
    expect(routes.privacyPolicy()).toBe('/datenschutz/')
  })

  it('refuses slugs that would break the URL', () => {
    expect(() => routes.course('../admin')).toThrow(/Invalid course slug/)
    expect(() => routes.course('Hatha Yoga')).toThrow()
    expect(() => routes.course('')).toThrow()
  })

  it('validates slugs', () => {
    expect(isValidSlug('tibetische-klangschalen')).toBe(true)
    expect(isValidSlug('a')).toBe(true)
    expect(isValidSlug('-x')).toBe(false)
    expect(isValidSlug('x--y')).toBe(false)
    expect(isValidSlug('Ü')).toBe(false)
  })

  it('every route keeps the trailing slash on both sides', () => {
    for (const route of Object.values(routeTable)) {
      expect(route.internal.endsWith('/')).toBe(true)
      expect(route.public.endsWith('/')).toBe(true)
    }
  })

  it('rewrites each German URL to its English route, skipping home', () => {
    const rewrites = buildRewrites()
    expect(rewrites).toContainEqual({ source: '/kurse/', destination: '/courses/' })
    expect(rewrites).toContainEqual({ source: '/kurse/:slug/', destination: '/courses/:slug/' })
    expect(rewrites).toContainEqual({ source: '/impressum/', destination: '/legal-notice/' })
    expect(rewrites.find((rule) => rule.source === '/')).toBeUndefined()
    expect(rewrites).toHaveLength(Object.keys(routeTable).length - 1)
  })

  it('301s each English URL to its German twin', () => {
    const redirects = buildRedirects()
    expect(redirects).toContainEqual({
      source: '/courses/:slug/',
      destination: '/kurse/:slug/',
      statusCode: 301,
    })
    expect(redirects.every((rule) => rule.statusCode === 301)).toBe(true)
  })

  it('never redirects a rewrite destination back onto a rewrite source (no loop)', () => {
    const rewriteSources = new Set(buildRewrites().map((rule) => rule.source))
    for (const redirect of buildRedirects()) {
      expect(rewriteSources.has(redirect.source)).toBe(false)
    }
  })

  it('never touches /admin or /api', () => {
    const all = [...buildRewrites(), ...buildRedirects()]
    for (const rule of all) {
      expect(rule.source.startsWith('/admin')).toBe(false)
      expect(rule.source.startsWith('/api')).toBe(false)
    }
  })

  it('builds absolute URLs', () => {
    expect(absoluteUrl('/kurse/', 'https://pranayogastudio.de')).toBe(
      'https://pranayogastudio.de/kurse/',
    )
    expect(absoluteUrl('kurse/', 'https://pranayogastudio.de/')).toBe(
      'https://pranayogastudio.de/kurse/',
    )
  })
})
