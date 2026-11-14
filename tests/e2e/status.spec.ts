import { expect, test, type APIRequestContext } from '@playwright/test'

import { seedCourses } from '../../seed/data/courses'
import { seedRedirects } from '../../seed/data/redirects'
import { login, publishGlobal } from './admin-api'
import { ALL_PAGES } from './pages'

/** 404 page, old WordPress URLs, sitemap and robots. */

test('an unknown page shows the 404 page with four ways back', async ({ page }) => {
  const response = await page.goto('/gibt-es-nicht/')
  expect(response?.status()).toBe(404)
  await expect(page.getByRole('heading', { level: 1, name: /Diese Seite gibt es/ })).toBeVisible()
  await expect(page).toHaveTitle(/Seite nicht gefunden/)
  await expect(page.locator('meta[name="robots"][content*="noindex"]')).not.toHaveCount(0)
  const ways = page.getByRole('navigation', { name: 'Wege zurück' })
  await expect(ways.getByRole('link')).toHaveCount(4)
  await expect(ways.getByRole('link', { name: /Startseite/ })).toHaveAttribute('href', '/')
})

for (const path of ['/gibt/es/nicht/', '/kurse/gibt-es-nicht/', '/kurse/Gross/']) {
  test(`${path} answers 404`, async ({ request }) => {
    const response = await request.get(path, { maxRedirects: 0 })
    expect(response.status()).toBe(404)
  })
}

for (const redirect of seedRedirects) {
  test(`the old ${redirect.from} redirects permanently to its successor`, async ({
    request,
    baseURL,
  }) => {
    const response = await request.get(redirect.from, { maxRedirects: 0 })
    expect([301, 308]).toContain(response.status())
    // Next sends the header twice, with the same value, on the render that fills the page cache
    // (docs/PLAN.md, Phase 3 status); browsers accept identical copies.
    const locations = response
      .headersArray()
      .filter((header) => header.name.toLowerCase() === 'location')
      .map((header) => new URL(header.value, baseURL).pathname)
    expect(locations.length).toBeGreaterThan(0)
    expect(new Set(locations)).toEqual(new Set([`/kurse/${redirect.toCourseSlug}/`]))
  })
}

test('a redirect added later replaces the cached 404 of that course address', async ({
  request,
}) => {
  const from = '/kurse/e2e-alter-kurs/'
  // The second visit is served from the page cache.
  for (let visit = 0; visit < 2; visit++) {
    expect((await request.get(from, { maxRedirects: 0 })).status()).toBe(404)
  }

  const headers = await login(request)
  const created = await request.post('/api/redirects', {
    headers,
    data: { from, to: { type: 'custom', url: '/kurse/hatha-yoga/' } },
  })
  expect(created.ok(), await created.text()).toBe(true)
  const { doc } = (await created.json()) as { doc: { id: number } }
  try {
    await expect
      .poll(async () => (await request.get(from, { maxRedirects: 0 })).status(), {
        timeout: 30_000,
      })
      .toBe(308)
  } finally {
    const removed = await request.delete(`/api/redirects/${doc.id}`, { headers })
    expect(removed.ok(), await removed.text()).toBe(true)
  }
})

test('while noindex is on, robots.txt blocks every crawler and the sitemap is empty', async ({
  request,
}) => {
  const robots = await request.get('/robots.txt')
  expect(robots.status()).toBe(200)
  const text = await robots.text()
  expect(text).toContain('User-Agent: *')
  expect(text).toContain('Disallow: /')
  expect(text).not.toContain('Allow: /')
  expect(text).not.toContain('Sitemap:')

  const sitemap = await request.get('/sitemap.xml')
  expect(sitemap.status()).toBe(200)
  expect(await sitemap.text()).not.toContain('<loc>')
})

test.describe('with noindex off', () => {
  /** Published through the admin and switched back on afterwards; the seed starts with it on. */
  async function setNoindex(request: APIRequestContext, noindex: boolean) {
    await publishGlobal(request, await login(request), 'technical-settings', { noindex })
    await expect
      .poll(async () => (await (await request.get('/sitemap.xml')).text()).includes('<loc>'), {
        timeout: 30_000,
      })
      .toBe(!noindex)
  }

  test('the sitemap lists every page and course, robots.txt points to it', async ({
    request,
    baseURL,
  }) => {
    await setNoindex(request, false)
    try {
      const xml = await (await request.get('/sitemap.xml')).text()
      const paths = [
        ...ALL_PAGES.map((sitePage) => sitePage.path),
        ...seedCourses.map((course) => `/kurse/${course.slug}/`),
      ]
      for (const path of new Set(paths)) expect(xml).toContain(`<loc>${baseURL}${path}</loc>`)
      expect(xml).not.toMatch(/\/(admin|api|next)\//)

      const robots = await (await request.get('/robots.txt')).text()
      expect(robots).toContain('Allow: /')
      expect(robots).toContain('Disallow: /admin/')
      expect(robots).toContain(`Sitemap: ${baseURL}/sitemap.xml`)
    } finally {
      await setNoindex(request, true)
    }
  })
})
