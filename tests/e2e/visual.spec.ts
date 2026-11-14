import { test } from '@playwright/test'

import { seedCourses } from '../../seed/data/courses'
import { INFO_PAGES } from './pages'
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

test('course overview at 1440', async ({ page }) => {
  await page.goto('/kurse/')
  await settle(page)
  await page.screenshot({ path: 'test-results/visual/kurse-1440.png', fullPage: true })
})

test('course overview at 390 @mobile', async ({ page }) => {
  await page.goto('/kurse/')
  await settle(page)
  await page.screenshot({ path: 'test-results/visual/kurse-390.png', fullPage: true })
})

for (const course of seedCourses) {
  test(`${course.title} at 1440`, async ({ page }) => {
    await page.goto(`/kurse/${course.slug}/`)
    await settle(page)
    await page.screenshot({
      path: `test-results/visual/kurs-${course.slug}-1440.png`,
      fullPage: true,
    })
  })
}

test('course page at 390 @mobile', async ({ page }) => {
  await page.goto('/kurse/hatha-yoga/')
  await settle(page)
  await page.screenshot({ path: 'test-results/visual/kurs-hatha-yoga-390.png', fullPage: true })
})

for (const sitePage of INFO_PAGES) {
  test(`${sitePage.name} at 1440`, async ({ page }) => {
    await page.goto(sitePage.path)
    await settle(page)
    await page.screenshot({ path: `test-results/visual/${sitePage.name}-1440.png`, fullPage: true })
  })

  test(`${sitePage.name} at 390 @mobile`, async ({ page }) => {
    await page.goto(sitePage.path)
    await settle(page)
    await page.screenshot({ path: `test-results/visual/${sitePage.name}-390.png`, fullPage: true })
  })
}

test('404 at 1440', async ({ page }) => {
  await page.goto('/gibt-es-nicht/')
  await settle(page)
  await page.screenshot({ path: 'test-results/visual/404-1440.png', fullPage: true })
})

test('404 at 390 @mobile', async ({ page }) => {
  await page.goto('/gibt-es-nicht/')
  await settle(page)
  await page.screenshot({ path: 'test-results/visual/404-390.png', fullPage: true })
})
