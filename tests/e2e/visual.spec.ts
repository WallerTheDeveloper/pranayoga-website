import { test } from '@playwright/test'

import { settle } from './settle'

/**
 * Full-page screenshots at 1440 and 390 for a side-by-side check against the design boards
 * (test-results/visual/). Not a pixel diff: the boards are HTML mock-ups, not baselines.
 */

test('home at 1440', async ({ page }) => {
  await page.goto('/')
  await settle(page)
  await page.screenshot({ path: 'test-results/visual/home-1440.png', fullPage: true })
})

test('home at 390 @mobile', async ({ page }) => {
  await page.goto('/')
  await settle(page)
  await page.screenshot({ path: 'test-results/visual/home-390.png', fullPage: true })
})
