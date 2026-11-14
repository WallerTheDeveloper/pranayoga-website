import { expect, test, type Page } from '@playwright/test'

/** Über uns: the certificates open in a modal lightbox (keyboard, focus trap, counter). */

function thumbnails(page: Page) {
  return page.getByRole('button', { name: /^Vergrößern: / })
}

function lightbox(page: Page) {
  return page.getByRole('dialog', { name: 'Zertifikat in voller Größe' })
}

async function openFirst(page: Page): Promise<void> {
  // Retry until hydrated: before that the thumbnails are plain buttons.
  await expect(async () => {
    await thumbnails(page).first().click()
    await expect(lightbox(page)).toBeVisible({ timeout: 1_000 })
  }).toPass()
}

test.beforeEach(async ({ page }) => {
  await page.goto('/ueber-uns/')
})

test('the arrow keys page through all certificates and wrap around', async ({ page }) => {
  await expect(thumbnails(page)).toHaveCount(6)
  await openFirst(page)
  const dialog = lightbox(page)
  await expect(dialog).toContainText('Zertifikat 1 von 6')
  await expect(dialog.getByRole('button', { name: 'Schließen' })).toBeFocused()

  await page.keyboard.press('ArrowRight')
  await expect(dialog).toContainText('Zertifikat 2 von 6')
  await page.keyboard.press('ArrowLeft')
  await page.keyboard.press('ArrowLeft')
  await expect(dialog).toContainText('Zertifikat 6 von 6')
  await dialog.getByRole('button', { name: 'Weiter' }).click()
  await expect(dialog).toContainText('Zertifikat 1 von 6')
})

test('focus stays in the lightbox; Escape closes it and returns focus', async ({ page }) => {
  await openFirst(page)
  for (let step = 0; step < 6; step += 1) {
    await page.keyboard.press('Tab')
    const location = await page.evaluate(() => {
      const active = document.activeElement
      if (!active || active === document.body) return 'browser'
      return active.closest('dialog[open]') ? 'dialog' : active.outerHTML.slice(0, 80)
    })
    expect(['dialog', 'browser']).toContain(location)
  }

  await page.keyboard.press('Escape')
  await expect(lightbox(page)).toBeHidden()
  await expect(thumbnails(page).first()).toBeFocused()
})

test('the close button closes the lightbox', async ({ page }) => {
  await openFirst(page)
  await lightbox(page).getByRole('button', { name: 'Schließen' }).click()
  await expect(lightbox(page)).toBeHidden()
})
