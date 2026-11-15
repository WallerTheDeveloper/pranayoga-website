import { describe, expect, it } from 'vitest'

import { routeTable } from '@/lib/routes'
import { warmUpPaths } from '@/lib/warmUp'

describe('warmUpPaths', () => {
  it('lists every fixed public page, each course page, robots and sitemap', () => {
    const paths = warmUpPaths(['hatha-yoga', 'rueckenyoga'])
    expect(paths).toEqual([
      '/',
      '/kurse/',
      '/mitgliedschaft-preise/',
      '/anmeldeformular/',
      '/ueber-uns/',
      '/yogaausbildungen/',
      '/kontakt/',
      '/impressum/',
      '/datenschutz/',
      '/kurse/hatha-yoga/',
      '/kurse/rueckenyoga/',
      '/robots.txt',
      '/sitemap.xml',
    ])
  })

  it('covers every route in the route table, so a new page cannot be forgotten', () => {
    const paths = warmUpPaths(['x'])
    for (const [key, route] of Object.entries(routeTable)) {
      const expected = key === 'course' ? route.public.replace(':slug', 'x') : route.public
      expect(paths).toContain(expected)
    }
  })

  it('works without courses', () => {
    expect(warmUpPaths([])).toHaveLength(Object.keys(routeTable).length - 1 + 2)
  })

  it('drops invalid slugs and duplicates instead of throwing', () => {
    const paths = warmUpPaths(['hatha-yoga', 'hatha-yoga', '../admin', 'Upper', ''])
    expect(paths.filter((path) => path.startsWith('/kurse/') && path !== '/kurse/')).toEqual([
      '/kurse/hatha-yoga/',
    ])
    expect(new Set(paths).size).toBe(paths.length)
  })
})
