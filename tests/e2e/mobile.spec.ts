import { expect, test } from '@playwright/test'

/** Phone layout (390 px): full-screen menu and the bottom action bar. */

test.beforeEach(async ({ page }) => {
  await page.goto('/')
})

test('the menu opens as a modal dialog and closes with Escape @mobile', async ({ page }) => {
  await expect(page.getByRole('navigation', { name: 'Hauptmenü', exact: true })).toBeHidden()
  const button = page.getByRole('button', { name: 'Menü', exact: true })
  await expect(button).toHaveAttribute('aria-expanded', 'false')

  await button.click()
  const dialog = page.getByRole('dialog', { name: 'Menü', exact: true })
  await expect(dialog).toBeVisible()
  await expect(button).toHaveAttribute('aria-expanded', 'true')
  await expect(dialog.getByRole('navigation', { name: 'Hauptmenü mobil' })).toBeVisible()
  await expect(dialog.getByRole('link', { name: /Hatha Yoga/ })).toBeVisible()

  await page.keyboard.press('Escape')
  await expect(dialog).toBeHidden()
  await expect(button).toBeFocused()
  await expect(button).toHaveAttribute('aria-expanded', 'false')
})

test('focus stays in the open menu and the page behind it is inert @mobile', async ({ page }) => {
  await page.getByRole('button', { name: 'Menü', exact: true }).click()
  await expect(page.getByRole('dialog', { name: 'Menü', exact: true })).toBeVisible()

  const stops = await page.evaluate(
    () => document.querySelectorAll('dialog[open] :is(a[href], button)').length,
  )
  // Past the last item, focus moves to the browser UI (reported as <body>) and wraps around.
  for (let step = 0; step < stops + 3; step += 1) {
    await page.keyboard.press('Tab')
    const location = await page.evaluate(() => {
      const active = document.activeElement
      if (!active || active === document.body) return 'browser'
      return active.closest('dialog[open]') ? 'dialog' : active.outerHTML.slice(0, 80)
    })
    expect(['dialog', 'browser']).toContain(location)
  }

  const headerLinkTakesFocus = await page.evaluate(() => {
    const link = document.querySelector<HTMLAnchorElement>('header a[href]')
    link?.focus()
    return link !== null && document.activeElement === link
  })
  expect(headerLinkTakesFocus).toBe(false)
})

test('the close button closes the menu @mobile', async ({ page }) => {
  await page.getByRole('button', { name: 'Menü', exact: true }).click()
  const dialog = page.getByRole('dialog', { name: 'Menü', exact: true })
  await dialog.getByRole('button', { name: 'Menü schließen' }).click()
  await expect(dialog).toBeHidden()
})

test('the action bar offers WhatsApp, call and email @mobile', async ({ page }) => {
  const bar = page.getByRole('region', { name: 'Kontakt' })
  await expect(bar).toBeVisible()
  await expect(bar.getByRole('link', { name: /Termin über WhatsApp/ })).toHaveAttribute(
    'href',
    /^https:\/\/chat\.whatsapp\.com\//,
  )
  await expect(bar.getByRole('link', { name: /Anrufen/ })).toHaveAttribute(
    'href',
    'tel:+491755830372',
  )
  await expect(bar.getByRole('link', { name: /E-Mail an/ })).toHaveAttribute(
    'href',
    'mailto:info@pranayogastudio.de',
  )
})

test('the page does not scroll sideways @mobile', async ({ page }) => {
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  )
  expect(overflow).toBeLessThanOrEqual(0)
})
