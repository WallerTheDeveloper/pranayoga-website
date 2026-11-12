import { expect, test, type Page } from '@playwright/test'

/** Desktop header: skip link, main nav and the courses dropdown by keyboard and pointer. */

function coursesTrigger(page: Page) {
  return page
    .getByRole('navigation', { name: 'Hauptmenü' })
    .getByRole('link', { name: 'Kurse', exact: true })
}

async function coursesPanel(page: Page) {
  const panelId = await coursesTrigger(page).getAttribute('aria-controls')
  return page.locator(`[id="${panelId}"]`)
}

test.beforeEach(async ({ page }) => {
  await page.goto('/')
  // Wait for hydration: the dropdown reports its state only once it is interactive.
  await expect(coursesTrigger(page)).toHaveAttribute('aria-expanded', 'false')
})

test('the skip link is the first stop and jumps to the content', async ({ page }) => {
  await page.keyboard.press('Tab')
  const skip = page.getByRole('link', { name: 'Zum Inhalt springen' })
  await expect(skip).toBeFocused()
  await expect(skip).toBeVisible()
  await page.keyboard.press('Enter')
  await expect(page).toHaveURL(/#main-content$/)
  await expect(page.getByRole('main')).toBeFocused()
})

test('the courses dropdown works with the keyboard', async ({ page }) => {
  const trigger = coursesTrigger(page)
  const panel = await coursesPanel(page)

  await page
    .getByRole('link', { name: /zur Startseite/ })
    .first()
    .focus()
  await page.keyboard.press('Tab')
  await expect(trigger).toBeFocused()
  await expect(trigger).toHaveAttribute('aria-expanded', 'true')
  await expect(panel).toBeVisible()

  await page.keyboard.press('Tab')
  await expect(panel.getByRole('link', { name: /Hatha Yoga/ })).toBeFocused()

  await page.keyboard.press('Escape')
  await expect(trigger).toBeFocused()
  await expect(trigger).toHaveAttribute('aria-expanded', 'false')
  await expect(panel).toBeHidden()
})

test('the courses dropdown opens on hover and lists every course', async ({ page }) => {
  const panel = await coursesPanel(page)
  await coursesTrigger(page).hover()
  await expect(panel).toBeVisible()
  await expect(panel.getByRole('listitem')).toHaveCount(6)
  await page.mouse.move(10, 600)
  await expect(panel).toBeHidden()
})

test('the courses dropdown links to the German course URLs', async ({ page }) => {
  const panel = await coursesPanel(page)
  await coursesTrigger(page).hover()
  await expect(panel.getByRole('link', { name: /Rad Yoga/ })).toHaveAttribute(
    'href',
    '/kurse/rad-yoga/',
  )
})
