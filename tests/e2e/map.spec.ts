import { expect, test, type Page } from '@playwright/test'

import { login, publishGlobal } from './admin-api'
import { settle } from './settle'

/**
 * Kontakt: Google Maps loads only after "Karte laden" (two-click consent). Google is stubbed, so
 * the test never reaches it; the embed address is set through the admin and removed afterwards.
 */

const EMBED_URL = 'https://www.google.com/maps/embed?pb=e2e-test'
const GOOGLE = /^https:\/\/(www|maps)\.google\.com\//

function recordGoogleRequests(page: Page): string[] {
  const requests: string[] = []
  page.on('request', (request) => {
    if (GOOGLE.test(request.url())) requests.push(request.url())
  })
  return requests
}

test.describe.configure({ mode: 'serial' })

test('without an embed address there is only the route link', async ({ page }) => {
  await page.goto('/kontakt/')
  await expect(page.getByRole('heading', { level: 2, name: 'Anfahrt' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Karte laden' })).toHaveCount(0)
  await expect(
    page.getByRole('link', { name: 'Route planen (öffnet Google Maps)' }),
  ).toHaveAttribute('href', /^https:\/\/www\.google\.com\/maps\/dir\/\?api=1&destination=/)
})

test('the map is requested from Google only after "Karte laden"', async ({ page, request }) => {
  const headers = await login(request)
  await publishGlobal(request, headers, 'technical-settings', { googleMapsEmbedUrl: EMBED_URL })
  try {
    const googleRequests = recordGoogleRequests(page)
    await page.route(GOOGLE, (route) =>
      route.fulfill({ contentType: 'text/html', body: '<!doctype html><title>Karte</title>' }),
    )
    const load = page.getByRole('button', { name: 'Karte laden' })
    await expect(async () => {
      await page.goto('/kontakt/')
      await expect(load).toBeVisible({ timeout: 2_000 })
    }).toPass({ timeout: 30_000 })
    await expect(
      page.getByText(/Beim Laden der Karte werden Daten an Google übertragen/),
    ).toBeVisible()
    await settle(page)

    expect(googleRequests).toEqual([])
    await expect(page.locator('iframe')).toHaveCount(0)

    await load.click()
    await expect(page.locator(`iframe[src="${EMBED_URL}"]`)).toBeVisible()
    await expect.poll(() => googleRequests).toContain(EMBED_URL)
  } finally {
    await publishGlobal(request, headers, 'technical-settings', { googleMapsEmbedUrl: null })
  }
})
