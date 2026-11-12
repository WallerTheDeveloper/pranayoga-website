import { expect, type Page } from '@playwright/test'

/**
 * Waits until the page looks finished: fonts loaded, every lazy image scrolled into view once and
 * every rendered image decoded. Use this instead of `networkidle`: link prefetches whose target
 * answers 404 (pages from later phases) keep their body unread, so the network never goes idle.
 */
export async function settle(page: Page): Promise<void> {
  await page.waitForLoadState('load')
  await page.evaluate(() => document.fonts.ready)
  // The site scrolls smoothly; jump instead, or the loop ends long before the page bottom.
  await page.evaluate(async () => {
    const root = document.documentElement
    for (let y = 0; y < root.scrollHeight; y += window.innerHeight / 2) {
      window.scrollTo({ top: y, behavior: 'instant' })
      await new Promise((resolve) => setTimeout(resolve, 50))
    }
    window.scrollTo({ top: 0, behavior: 'instant' })
  })
  // Images inside closed dialogs are not rendered, so lazy ones there never load.
  await expect
    .poll(() =>
      page.evaluate(() =>
        [...document.images]
          .filter((image) => image.offsetParent !== null)
          .every((image) => image.complete),
      ),
    )
    .toBe(true)
}
