import { describe, expect, it } from 'vitest'

import { getMediaDir, DEFAULT_MEDIA_DIR, EnvValidationError } from '@/lib/env'
import { isSafePreviewPath, previewPathFor, previewUrl, PREVIEW_ROUTE } from '@/lib/preview'
import { isCurrentPage, isCurrentSection, toPublicPath } from '@/lib/routes'
import { secretsMatch } from '@/lib/secrets'
import {
  isGoogleMapsEmbedUrl,
  isSafeRedirectTarget,
  isSiteOrigin,
  isValidPostalCode,
  normalizeRedirectSource,
} from '@/lib/validation/url'

describe('site origin', () => {
  it('accepts bare http(s) origins', () => {
    expect(isSiteOrigin('https://pranayogastudio.de')).toBe(true)
    expect(isSiteOrigin('https://pranayogastudio.de/')).toBe(true)
    expect(isSiteOrigin('http://localhost:3000')).toBe(true)
  })

  it('rejects paths, queries, credentials and other schemes', () => {
    expect(isSiteOrigin('https://pranayogastudio.de/kurse')).toBe(false)
    expect(isSiteOrigin('https://pranayogastudio.de?x=1')).toBe(false)
    expect(isSiteOrigin('https://pranayogastudio.de#top')).toBe(false)
    expect(isSiteOrigin('https://user:pw@pranayogastudio.de')).toBe(false)
    expect(isSiteOrigin('ftp://pranayogastudio.de')).toBe(false)
    expect(isSiteOrigin('https://pranayogastudio.de//')).toBe(false)
    expect(isSiteOrigin('nope')).toBe(false)
  })
})

describe('Google Maps embed URL', () => {
  it('accepts the embed iframe src', () => {
    expect(isGoogleMapsEmbedUrl('https://www.google.com/maps/embed?pb=!1m18')).toBe(true)
    expect(isGoogleMapsEmbedUrl('https://maps.google.com/maps/embed/v1/place?q=x')).toBe(true)
  })

  it('rejects other hosts, paths and http', () => {
    expect(isGoogleMapsEmbedUrl('http://www.google.com/maps/embed?pb=1')).toBe(false)
    expect(isGoogleMapsEmbedUrl('https://www.google.com/maps/place/x')).toBe(false)
    expect(isGoogleMapsEmbedUrl('https://google.com.evil.example/maps/embed')).toBe(false)
    expect(isGoogleMapsEmbedUrl('')).toBe(false)
  })
})

describe('postal code', () => {
  it('needs five digits', () => {
    expect(isValidPostalCode('45356')).toBe(true)
    expect(isValidPostalCode('4535')).toBe(false)
    expect(isValidPostalCode('45356a')).toBe(false)
  })
})

describe('redirect paths', () => {
  it('normalises old URLs to lowercase paths with a trailing slash', () => {
    expect(normalizeRedirectSource('/kurse/Yin-Yoga')).toBe('/kurse/yin-yoga/')
    expect(normalizeRedirectSource('kurse/yin-yoga/')).toBe('/kurse/yin-yoga/')
    expect(normalizeRedirectSource('https://pranayogastudio.de/kurse/yin-yoga')).toBe(
      '/kurse/yin-yoga/',
    )
    expect(normalizeRedirectSource('/wp-content/plan.pdf')).toBe('/wp-content/plan.pdf')
  })

  it('refuses reserved, root, protocol-relative and odd paths', () => {
    expect(normalizeRedirectSource('/admin/')).toBeNull()
    expect(normalizeRedirectSource('/api/users')).toBeNull()
    expect(normalizeRedirectSource('/')).toBeNull()
    expect(normalizeRedirectSource('//evil.example/x')).toBeNull()
    expect(normalizeRedirectSource('/a b')).toBeNull()
    expect(normalizeRedirectSource('/a?b=1')).toBeNull()
    expect(normalizeRedirectSource('javascript:alert(1)')).toBeNull()
    expect(normalizeRedirectSource('  ')).toBeNull()
  })

  it('allows same-site or https targets only', () => {
    expect(isSafeRedirectTarget('/kurse/hatha-yoga/')).toBe(true)
    expect(isSafeRedirectTarget('https://example.com/')).toBe(true)
    expect(isSafeRedirectTarget('//evil.example')).toBe(false)
    expect(isSafeRedirectTarget('/\\evil.example')).toBe(false)
    expect(isSafeRedirectTarget('http://example.com/')).toBe(false)
    expect(isSafeRedirectTarget('javascript:alert(1)')).toBe(false)
  })

  it('refuses control characters and inner whitespace (browsers strip them)', () => {
    expect(isSafeRedirectTarget('  /kurse/  ')).toBe(true)
    for (const target of [
      '/\t/evil.example',
      '/\n/evil.example',
      '/ku rse/',
      'https://ex\tample.com/',
    ]) {
      expect(isSafeRedirectTarget(target), JSON.stringify(target)).toBe(false)
    }
  })
})

describe('preview paths', () => {
  it('accepts public page paths', () => {
    expect(isSafePreviewPath('/')).toBe(true)
    expect(isSafePreviewPath('/kurse/hatha-yoga/')).toBe(true)
    // Dots inside a segment are fine; only whole "." / ".." segments climb.
    expect(isSafePreviewPath('/downloads/vertrag.pdf')).toBe(true)
    expect(isSafePreviewPath('/a..b/')).toBe(true)
  })

  it('rejects open redirects and internal paths', () => {
    for (const path of [
      '',
      'kurse/',
      '//evil.example',
      '/\\evil.example',
      '/x\nSet-Cookie: a',
      '/redirect?to=https://evil.example',
      '/admin',
      '/admin/collections',
      '/api/users',
      '/next/preview/',
      '/kurse/../admin/',
      '/kurse/./',
      '/kurse/%2e%2e/admin/',
      '/kurse/%2E./api/',
      '/..',
      `/${'a'.repeat(200)}`,
      42,
    ]) {
      expect(isSafePreviewPath(path), String(path)).toBe(false)
    }
  })

  it('maps documents to their page', () => {
    expect(previewPathFor({ kind: 'global', slug: 'business-settings' })).toBe('/')
    expect(previewPathFor({ kind: 'global', slug: 'technical-settings' })).toBeNull()
    expect(previewPathFor({ kind: 'global', slug: 'teacher-training' })).toBe('/yogaausbildungen/')
    expect(previewPathFor({ kind: 'global', slug: 'legal-notice' })).toBe('/impressum/')
    expect(previewPathFor({ kind: 'global', slug: 'privacy-policy' })).toBe('/datenschutz/')
    expect(
      previewPathFor({ kind: 'collection', slug: 'courses', data: { slug: 'rad-yoga' } }),
    ).toBe('/kurse/rad-yoga/')
    expect(
      previewPathFor({ kind: 'collection', slug: 'courses', data: { slug: '../x' } }),
    ).toBeNull()
    expect(previewPathFor({ kind: 'collection', slug: 'courses', data: {} })).toBeNull()
    expect(previewPathFor({ kind: 'collection', slug: 'price-groups', data: {} })).toBe(
      '/mitgliedschaft-preise/',
    )
    expect(previewPathFor({ kind: 'collection', slug: 'reviews', data: {} })).toBe('/')
    expect(previewPathFor({ kind: 'collection', slug: 'media', data: {} })).toBeNull()
  })

  it('builds the preview URL with encoded parameters', () => {
    const url = new URL(
      previewUrl({ origin: 'https://pranayogastudio.de/', secret: 's&cret', path: '/kurse/' }),
    )
    expect(url.pathname).toBe(PREVIEW_ROUTE)
    expect(url.searchParams.get('secret')).toBe('s&cret')
    expect(url.searchParams.get('path')).toBe('/kurse/')
  })
})

describe('secretsMatch', () => {
  it('matches equal secrets only', () => {
    expect(secretsMatch('a-long-preview-secret', 'a-long-preview-secret')).toBe(true)
    expect(secretsMatch('a-long-preview-secreT', 'a-long-preview-secret')).toBe(false)
    expect(secretsMatch('short', 'a-long-preview-secret')).toBe(false)
  })

  it('never matches empty or missing values', () => {
    expect(secretsMatch('', '')).toBe(false)
    expect(secretsMatch(null, 'x')).toBe(false)
    expect(secretsMatch(undefined, 'x')).toBe(false)
    expect(secretsMatch('x', '')).toBe(false)
  })
})

describe('public path normalisation', () => {
  it('maps internal paths to German ones', () => {
    expect(toPublicPath('/courses/')).toBe('/kurse/')
    expect(toPublicPath('/courses/hatha-yoga')).toBe('/kurse/hatha-yoga/')
    expect(toPublicPath('/pricing/?x=1#top')).toBe('/mitgliedschaft-preise/')
    expect(toPublicPath('/kurse/hatha-yoga/')).toBe('/kurse/hatha-yoga/')
    expect(toPublicPath('/')).toBe('/')
    expect(toPublicPath('/unknown')).toBe('/unknown/')
  })

  it('marks the current page and section', () => {
    expect(isCurrentPage('/courses/', '/kurse/')).toBe(true)
    expect(isCurrentPage('/kurse/hatha-yoga/', '/kurse/')).toBe(false)
    expect(isCurrentPage(null, '/kurse/')).toBe(false)
    expect(isCurrentSection('/courses/hatha-yoga/', '/kurse/')).toBe(true)
    expect(isCurrentSection('/kontakt/', '/kurse/')).toBe(false)
    expect(isCurrentSection('/kurse/', '/')).toBe(false)
    expect(isCurrentSection(null, '/kurse/')).toBe(false)
  })
})

describe('getMediaDir', () => {
  it('defaults to uploads/media', () => {
    expect(getMediaDir({})).toBe(DEFAULT_MEDIA_DIR)
    expect(getMediaDir({ MEDIA_DIR: '  ' })).toBe(DEFAULT_MEDIA_DIR)
  })

  it('accepts a relative folder', () => {
    expect(getMediaDir({ MEDIA_DIR: 'uploads/test-media' })).toBe('uploads/test-media')
  })

  it('rejects absolute paths and parent segments', () => {
    for (const value of [
      '/var/media',
      'C:\\media',
      '\\\\share\\media',
      '../media',
      'uploads/../../x',
    ]) {
      expect(() => getMediaDir({ MEDIA_DIR: value }), value).toThrow(EnvValidationError)
    }
  })
})
