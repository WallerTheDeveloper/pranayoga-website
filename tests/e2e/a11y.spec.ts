import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'

import { seedCourses } from '../../seed/data/courses'

/** axe-core on every built page: no serious or critical WCAG 2.2 AA violations. */

const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']

async function seriousViolations(page: Page) {
  const results = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze()
  return results.violations
    .filter((violation) => violation.impact === 'serious' || violation.impact === 'critical')
    .map((violation) => ({
      id: violation.id,
      help: violation.help,
      targets: violation.nodes.map((node) => node.target.join(' ')),
    }))
}

test('home page, desktop', async ({ page }) => {
  await page.goto('/')
  expect(await seriousViolations(page)).toEqual([])
})

test('home page with the courses dropdown open', async ({ page }) => {
  await page.goto('/')
  const trigger = page
    .getByRole('navigation', { name: 'Hauptmenü' })
    .getByRole('link', { name: 'Kurse', exact: true })
  await expect(trigger).toHaveAttribute('aria-expanded', 'false')
  await trigger.hover()
  await expect(trigger).toHaveAttribute('aria-expanded', 'true')
  // Wait for the fade-in: contrast checks on a half-transparent panel are unreliable.
  const panel = page.locator(`[id="${await trigger.getAttribute('aria-controls')}"]`)
  await expect(panel).toHaveCSS('opacity', '1')
  expect(await seriousViolations(page)).toEqual([])
})

test('home page, phone @mobile', async ({ page }) => {
  await page.goto('/')
  expect(await seriousViolations(page)).toEqual([])
})

test('open mobile menu @mobile', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Menü', exact: true }).click()
  const dialog = page.getByRole('dialog', { name: 'Menü', exact: true })
  await expect(dialog).toBeVisible()
  await expect(dialog).toHaveCSS('opacity', '1')
  expect(await seriousViolations(page)).toEqual([])
})

test('course overview, desktop', async ({ page }) => {
  await page.goto('/kurse/')
  expect(await seriousViolations(page)).toEqual([])
})

test('course overview, phone @mobile', async ({ page }) => {
  await page.goto('/kurse/')
  expect(await seriousViolations(page)).toEqual([])
})

// Each course uses other template variants (photos, quote, side image), so check them all.
for (const course of seedCourses) {
  test(`${course.title}, desktop`, async ({ page }) => {
    await page.goto(`/kurse/${course.slug}/`)
    expect(await seriousViolations(page)).toEqual([])
  })
}

test('course page, phone @mobile', async ({ page }) => {
  await page.goto('/kurse/hatha-yoga/')
  expect(await seriousViolations(page)).toEqual([])
})
