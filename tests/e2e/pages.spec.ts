import { expect, test } from '@playwright/test'

import { INFO_PAGES, PLACEHOLDER } from './pages'

/** The phase-3 pages: they answer, carry their heading and canonical URL, and hide placeholders. */

for (const sitePage of INFO_PAGES) {
  test(`${sitePage.path} answers 200 with its heading and no placeholders`, async ({ page }) => {
    const response = await page.goto(sitePage.path)
    expect(response?.status()).toBe(200)
    await expect(page.getByRole('heading', { level: 1, name: sitePage.heading })).toBeVisible()
    const canonical = await page.locator('link[rel="canonical"]').getAttribute('href')
    expect(new URL(canonical ?? '', 'http://x').pathname).toBe(sitePage.path)
    expect(await page.locator('body').innerText()).not.toMatch(PLACEHOLDER)
  })
}

test('teacher training: questions go to the personal WhatsApp chat', async ({ page }) => {
  await page.goto('/yogaausbildungen/')
  // Offered twice: in the hero and again under "So melden Sie sich an".
  const links = page.getByRole('link', {
    name: 'Fragen per WhatsApp an Liudmyla (öffnet WhatsApp)',
  })
  await expect(links).toHaveCount(2)
  for (const link of await links.all()) {
    await expect(link).toHaveAttribute('href', 'https://wa.me/491755830372')
  }
  await expect(
    page
      .getByRole('region', { name: 'So melden Sie sich an' })
      .getByRole('link', { name: /^Fragen per WhatsApp an Liudmyla/ }),
  ).toBeVisible()
  // Dates are not fixed yet: the page says so instead of showing an empty list.
  await expect(page.getByText('Die genauen Termine geben wir bald bekannt.')).toBeVisible()
})

test('pricing: each signup plan links to the form, the bank details are shown', async ({
  page,
}) => {
  await page.goto('/mitgliedschaft-preise/')
  await expect(page.getByRole('link', { name: 'Online anmelden: 1× pro Woche' })).toHaveAttribute(
    'href',
    '/anmeldeformular/',
  )
  await expect(page.getByText('DE11 3607 0024 0454 8384 01')).toBeVisible()
})

test('pricing: the IBAN copies without spaces', async ({ page, context, browserName }) => {
  test.skip(browserName !== 'chromium', 'clipboard permissions are Chromium-only')
  await context.grantPermissions(['clipboard-read', 'clipboard-write'])
  await page.goto('/mitgliedschaft-preise/')
  await page.getByRole('button', { name: 'IBAN kopieren' }).click()
  await expect(page.getByRole('button', { name: 'Kopiert' })).toBeVisible()
  await expect(page.getByText('Die IBAN wurde in die Zwischenablage kopiert.')).toBeVisible()
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe('DE11360700240454838401')
})

for (const path of ['/impressum/', '/datenschutz/']) {
  test(`${path} shows a note while the legal text is pending`, async ({ page }) => {
    await page.goto(path)
    await expect(page.getByText(/Dieser Text wird gerade überarbeitet/)).toBeVisible()
  })
}

test('the Impressum names the provider with phone and email', async ({ page }) => {
  await page.goto('/impressum/')
  const card = page.getByRole('main').locator('address')
  await expect(card).toContainText('Liudmyla Schiemann')
  await expect(card.getByRole('link', { name: '0175 5830372' })).toHaveAttribute(
    'href',
    'tel:+491755830372',
  )
})
