import { expect, test } from '@playwright/test'

import { routeTable } from '../../src/lib/routes'
import { ALL_PAGES } from './pages'

/** Public German URLs, English route folders 301 to them, and links only ever use German URLs. */

const PUBLIC_PATTERNS = Object.values(routeTable).map(
  (route) => new RegExp(`^${route.public.replace(':slug', '[a-z0-9-]+')}$`),
)
const INTERNAL_ONLY = Object.values(routeTable)
  .filter((route) => route.internal !== route.public)
  .map((route) => route.internal.replace(':slug', 'hatha-yoga'))

test('the home page answers 200', async ({ request }) => {
  const response = await request.get('/')
  expect(response.status()).toBe(200)
  expect(response.headers()['content-type']).toContain('text/html')
})

for (const path of INTERNAL_ONLY) {
  test(`${path} redirects permanently to its German URL`, async ({ request, baseURL }) => {
    const response = await request.get(path, { maxRedirects: 0 })
    expect(response.status()).toBe(301)
    const location = new URL(response.headers()['location'] ?? '', baseURL)
    expect(PUBLIC_PATTERNS.some((pattern) => pattern.test(location.pathname))).toBe(true)
    expect(location.pathname).not.toBe(path)
  })
}

for (const pagePath of ALL_PAGES.map((sitePage) => sitePage.path)) {
  test(`every internal link on ${pagePath} uses a German URL`, async ({ page }) => {
    await page.goto(pagePath)
    const hrefs = await page
      .locator('a[href^="/"]')
      .evaluateAll((links) =>
        links.map((link) => new URL((link as HTMLAnchorElement).href).pathname),
      )
    const pagePaths = [...new Set(hrefs)].filter((href) => !href.startsWith('/api/'))
    expect(pagePaths.length).toBeGreaterThan(10)
    for (const href of pagePaths) {
      expect(
        PUBLIC_PATTERNS.some((pattern) => pattern.test(href)),
        href,
      ).toBe(true)
    }
  })
}

test('pages that do not exist answer 404', async ({ request }) => {
  const response = await request.get('/gibt-es-nicht/')
  expect(response.status()).toBe(404)
})
