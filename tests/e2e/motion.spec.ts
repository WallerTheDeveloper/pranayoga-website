import { expect, test, type Page } from '@playwright/test'

import { login, publishGlobal } from './admin-api'

/**
 * Motion with the visitor's default preference (the other specs run with reduced motion, so
 * screenshots and axe see every section): scroll reveals, breathing ring, page change, intro.
 */

test.use({ reducedMotion: 'no-preference' })

/** True when every `.rv` block that starts inside the first screen has been revealed. */
function firstScreenRevealed(page: Page): Promise<boolean> {
  return page.evaluate(() =>
    [...document.querySelectorAll('.rv')]
      .filter((block) => block.getBoundingClientRect().top < window.innerHeight)
      .every((block) => block.classList.contains('in')),
  )
}

test('what is on screen at load is never hidden; lower sections rise in on scroll', async ({
  page,
}) => {
  await page.goto('/')
  await expect(page.locator('html')).toHaveClass(/\brv-on\b/)
  expect(await firstScreenRevealed(page)).toBe(true)

  const last = page.locator('.rv').last()
  await expect(last).not.toHaveClass(/\bin\b/)
  await last.scrollIntoViewIfNeeded()
  await expect(last).toHaveClass(/\bin\b/)
  await expect(last).toHaveCSS('opacity', '1')
})

test('the Prana ring breathes in an 8 second cycle', async ({ page }) => {
  await page.goto('/ueber-uns/')
  const ring = page.locator('.breath').first()
  await expect(ring).toHaveCSS('animation-name', 'breath')
  await expect(ring).toHaveCSS('animation-duration', '8s')
})

test('a page change keeps the header in place', async ({ page }) => {
  await page.goto('/')
  const mainNav = page.getByRole('navigation', { name: 'Hauptmenü' })
  // Wait for hydration: the dropdown reports its state only once it is interactive.
  await expect(mainNav.getByRole('link', { name: 'Kurse', exact: true })).toHaveAttribute(
    'aria-expanded',
    'false',
  )
  await page.evaluate(() => document.querySelector('header')?.setAttribute('data-e2e-kept', ''))

  await mainNav.getByRole('link', { name: 'Kontakt', exact: true }).click()
  await expect(page).toHaveURL(/\/kontakt\/$/)
  await expect(page.getByRole('heading', { level: 1, name: 'Kontakt' })).toBeVisible()
  await expect(page.locator('header[data-e2e-kept]')).toHaveCount(1)
})

test.describe('with reduced motion', () => {
  test.use({ reducedMotion: 'reduce' })

  test('nothing waits to be revealed and the ring stands still', async ({ page }) => {
    await page.goto('/ueber-uns/')
    await expect(page.locator('.breath').first()).toHaveCSS('animation-name', 'none')
    const hidden = await page.evaluate(
      () =>
        [...document.querySelectorAll('.rv')].filter(
          (block) => getComputedStyle(block).opacity !== '1',
        ).length,
    )
    expect(hidden).toBe(0)
  })
})

test.describe('intro loader', () => {
  test.describe.configure({ mode: 'serial' })

  test('plays on a fresh visit only, behind its feature flag', async ({ page, request }) => {
    const headers = await login(request)
    const flags = (introLoader: boolean) => ({ featureFlags: { introLoader, cookieBanner: false } })
    await publishGlobal(request, headers, 'technical-settings', flags(true))
    try {
      await expect(async () => {
        await page.goto('/')
        await expect(page.locator('.intro-loader')).toHaveCount(1, { timeout: 2_000 })
      }).toPass({ timeout: 30_000 })

      await page.goto('/kurse/')
      const html = page.locator('html')
      await expect(html).toHaveClass(/\bintro\b/)
      await expect(page.locator('.intro-loader')).toBeVisible()
      await expect(html).not.toHaveClass(/\bintro\b/, { timeout: 5_000 })
      await expect(page.locator('.intro-loader')).toBeHidden()

      await page.reload()
      await expect(html).not.toHaveClass(/\bintro\b/)
    } finally {
      await publishGlobal(request, headers, 'technical-settings', flags(false))
    }
  })
})
