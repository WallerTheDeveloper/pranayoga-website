import { describe, expect, it } from 'vitest'

import { DOWNLOAD_USAGES, isDownloadUsage } from '@/lib/downloads'
import { DEFAULT_DOWNLOADS_DIR, EnvValidationError, getDownloadsDir } from '@/lib/env'
import { formatDate, formatDateRange } from '@/lib/format'
import { PRIVATE_PATHS, STATIC_PATHS, buildRobots, buildSitemap } from '@/lib/seo'
import { safeHref } from '@/lib/validation/href'
import { redirectLoops, sameSiteRedirectPath } from '@/lib/validation/url'
import { ibanProblem } from '@/lib/validation/iban'
import { isPlausiblePhone } from '@/lib/validation/phone'

const SITE = 'https://www.pranayogastudio.de'

describe('sitemap and robots', () => {
  it('lists every fixed page first, then the courses, as absolute URLs', () => {
    const sitemap = buildSitemap(SITE, ['/kurse/hatha-yoga/'], false)
    expect(sitemap.map((entry) => entry.url)).toEqual([
      ...STATIC_PATHS.map((path) => `${SITE}${path}`),
      `${SITE}/kurse/hatha-yoga/`,
    ])
    expect(STATIC_PATHS).toContain('/impressum/')
    expect(STATIC_PATHS).not.toContain('/courses/')
  })

  it('blocks everything and lists nothing while noindex is on', () => {
    expect(buildRobots(SITE, true)).toEqual({ rules: { userAgent: '*', disallow: '/' } })
    expect(buildSitemap(SITE, ['/kurse/hatha-yoga/'], true)).toEqual([])
  })

  it('otherwise allows the site but the private areas, and names the sitemap', () => {
    expect(buildRobots(SITE, false)).toEqual({
      rules: { userAgent: '*', allow: '/', disallow: [...PRIVATE_PATHS] },
      sitemap: `${SITE}/sitemap.xml`,
    })
    expect(PRIVATE_PATHS).toEqual(['/admin/', '/api/', '/next/'])
  })
})

describe('safeHref', () => {
  it('keeps web, mail and phone links and same-site paths', () => {
    for (const href of [
      'https://example.test/a',
      'http://example.test',
      'mailto:info@pranayogastudio.de',
      'tel:+491755830372',
      '/kontakt/',
      '#abschnitt',
      '?a=1',
    ]) {
      expect(safeHref(href), href).toBe(href)
    }
    expect(safeHref('  /kurse/  ')).toBe('/kurse/')
  })

  it('refuses scripts, data, protocol-relative and malformed links', () => {
    for (const href of [
      'javascript:alert(1)',
      ' JaVaScRiPt:alert(1)',
      'data:text/html,x',
      'vbscript:x',
      '//evil.test/',
      '/' + String.fromCharCode(92) + 'evil.test/',
      '/' + String.fromCharCode(9) + '/evil.test/',
      'not a url',
      '',
      '   ',
      42,
      null,
    ]) {
      expect(safeHref(href), String(href)).toBeNull()
    }
  })
})

describe('ibanProblem', () => {
  it('is null for a valid IBAN', () => {
    expect(ibanProblem('DE89 3704 0044 0532 0130 00')).toBeNull()
  })

  it('reports a wrong shape or length as a format problem', () => {
    expect(ibanProblem('DE89 3704')).toBe('format')
    expect(ibanProblem('')).toBe('format')
    expect(ibanProblem('DE89 3704 0044 0532 0130 000')).toBe('format')
    expect(ibanProblem('8937 0400 4405 3201 3000')).toBe('format')
  })

  it('reports a typo as a checksum problem', () => {
    expect(ibanProblem('DE88 3704 0044 0532 0130 00')).toBe('checksum')
  })
})

describe('isPlausiblePhone', () => {
  it('accepts numbers as people type them', () => {
    for (const phone of ['0201 123456', '+49 175 5830372', '(0201) 12 34 56', '0201/123-456']) {
      expect(isPlausiblePhone(phone), phone).toBe(true)
    }
  })

  it('rejects letters, a plus in the middle and too few or too many digits', () => {
    for (const phone of ['0201 abc', '0201+123456', '12345', '1234567890123456', '']) {
      expect(isPlausiblePhone(phone), phone).toBe(false)
    }
  })
})

describe('date formatting', () => {
  it('formatDate writes the day on the studio calendar', () => {
    expect(formatDate('2026-11-12T10:00:00.000Z')).toBe('12. November 2026')
    // Local midnight in Germany is the evening before in UTC.
    expect(formatDate('2027-03-13T23:00:00.000Z')).toBe('14. März 2027')
    expect(formatDate(null)).toBeNull()
    expect(formatDate('kein Datum')).toBeNull()
  })

  it('formatDateRange keeps a span as short as German allows', () => {
    expect(formatDateRange('2027-03-14T10:00:00Z', '2027-03-15T10:00:00Z')).toBe(
      '14.–15. März 2027',
    )
    expect(formatDateRange('2027-05-31T10:00:00Z', '2027-06-01T10:00:00Z')).toBe(
      '31. Mai – 1. Juni 2027',
    )
    expect(formatDateRange('2027-12-31T10:00:00Z', '2028-01-01T10:00:00Z')).toBe(
      '31. Dezember 2027 – 1. Januar 2028',
    )
  })

  it('formatDateRange collapses a missing, earlier or same-day end to the first day', () => {
    expect(formatDateRange('2027-03-14T10:00:00Z', null)).toBe('14. März 2027')
    expect(formatDateRange('2027-03-14T10:00:00Z', '2027-03-13T10:00:00Z')).toBe('14. März 2027')
    expect(formatDateRange('2027-03-14T08:00:00Z', '2027-03-14T18:00:00Z')).toBe('14. März 2027')
    expect(formatDateRange(null, '2027-03-14T10:00:00Z')).toBeNull()
  })
})

describe('downloads', () => {
  it('knows the two places a PDF can appear', () => {
    expect(DOWNLOAD_USAGES).toEqual(['membership-contract', 'teacher-training-flyer'])
    expect(isDownloadUsage('membership-contract')).toBe(true)
    expect(isDownloadUsage('flyer')).toBe(false)
    expect(isDownloadUsage(null)).toBe(false)
  })

  it('reads its upload folder from DOWNLOADS_DIR, with a default', () => {
    expect(getDownloadsDir({})).toBe(DEFAULT_DOWNLOADS_DIR)
    expect(getDownloadsDir({ DOWNLOADS_DIR: 'uploads/test-downloads' })).toBe(
      'uploads/test-downloads',
    )
    expect(() => getDownloadsDir({ DOWNLOADS_DIR: '../outside' })).toThrow(EnvValidationError)
  })
})

describe('redirect loops', () => {
  const others = new Map([
    ['/alt-b/', '/alt-c/'],
    ['/alt-c/', '/alt-a/'],
    ['/kurse/kreis/', '/kurse/kreis/'],
  ])

  it('reads same-site targets as stored sources and ignores other sites', () => {
    expect(sameSiteRedirectPath(' /Kurse/Hatha-Yoga ')).toBe('/kurse/hatha-yoga/')
    expect(sameSiteRedirectPath('https://example.test/kurse/')).toBeNull()
  })

  it('finds a redirect to itself and a chain that comes back', () => {
    expect(redirectLoops('/alt-a/', '/alt-a', new Map())).toBe(true)
    expect(redirectLoops('/alt-a/', '/alt-b/', others)).toBe(true)
  })

  it('accepts chains that end, other sites and loops it is not part of', () => {
    expect(redirectLoops('/alt-x/', '/alt-b/', others)).toBe(false)
    expect(redirectLoops('/alt-x/', '/kurse/hatha-yoga/', others)).toBe(false)
    expect(redirectLoops('/alt-x/', 'https://example.test/alt-x/', others)).toBe(false)
    expect(redirectLoops('/alt-x/', '/kurse/kreis/', others)).toBe(false)
    expect(redirectLoops('/', '/alt-a/', others)).toBe(false)
  })
})
