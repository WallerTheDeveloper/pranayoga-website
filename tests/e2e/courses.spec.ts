import { expect, test, type APIRequestContext } from '@playwright/test'

import { seedCourses } from '../../seed/data/courses'
import { E2E_ADMIN } from './constants'

/** The course overview and the six course pages, as seeded from the design. */

const SCHEDULE_SLUG = 'hatha-yoga'

async function login(request: APIRequestContext): Promise<Record<string, string>> {
  const response = await request.post('/api/users/login', { data: E2E_ADMIN })
  expect(response.ok()).toBe(true)
  const { token } = (await response.json()) as { token: string }
  return { Authorization: `JWT ${token}` }
}

async function courseId(
  request: APIRequestContext,
  headers: Record<string, string>,
  slug: string,
): Promise<number> {
  const response = await request.get('/api/courses', {
    headers,
    params: { 'where[slug][equals]': slug, limit: '1', depth: '0' },
  })
  expect(response.ok()).toBe(true)
  const { docs } = (await response.json()) as { docs: { id: number }[] }
  const doc = docs[0]
  if (!doc) throw new Error(`Seeded course "${slug}" not found`)
  return doc.id
}

test('the overview lists every course in admin order, linking to German URLs', async ({ page }) => {
  const response = await page.goto('/kurse/')
  expect(response?.status()).toBe(200)
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Yoga-Kurse in Essen-Borbeck')
  await expect(page).toHaveTitle(/^Yoga-Kurse in Essen-Borbeck · /)

  const list = page.getByRole('region', { name: 'Alle Kurse' })
  const cards = list.getByRole('link').filter({ has: page.getByRole('heading', { level: 3 }) })
  await expect(cards).toHaveCount(seedCourses.length)
  const hrefs = await cards.evaluateAll((links) =>
    links.map((link) => new URL((link as HTMLAnchorElement).href).pathname),
  )
  expect(hrefs).toEqual(seedCourses.map((course) => `/kurse/${course.slug}/`))

  await expect(page.getByRole('heading', { name: 'Was benötige ich?' })).toBeVisible()
  await expect(page.getByRole('link', { name: /Zur Yogaausbildung/ })).toHaveAttribute(
    'href',
    '/yogaausbildungen/',
  )
})

for (const course of seedCourses) {
  test(`${course.title} renders from the template`, async ({ page }) => {
    const response = await page.goto(`/kurse/${course.slug}/`)
    expect(response?.status()).toBe(200)
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(course.title)

    const crumbs = page.getByRole('navigation', { name: 'Sie sind hier' })
    await expect(crumbs.getByRole('link', { name: 'Kurse' })).toHaveAttribute('href', '/kurse/')
    await expect(crumbs.locator('[aria-current="page"]')).toHaveText(course.title)
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      'href',
      new RegExp(`/kurse/${course.slug}/$`),
    )

    const related = page.getByRole('region', { name: 'Weitere Kurse' })
    const relatedLinks = related.getByRole('link').filter({ has: page.getByRole('heading') })
    await expect(relatedLinks).toHaveCount(3)
    for (const href of await relatedLinks.evaluateAll((links) =>
      links.map((link) => link.getAttribute('href')),
    )) {
      expect(href).not.toBe(`/kurse/${course.slug}/`)
    }
  })
}

test('FAQ answers open and close', async ({ page }) => {
  await page.goto('/kurse/hatha-yoga/')
  const faq = page.getByRole('region', { name: 'Häufige Fragen' })
  const items = faq.locator('details')
  expect(await items.count()).toBeGreaterThan(1)

  await expect(items.nth(0)).toHaveAttribute('open', '')
  await expect(items.nth(1)).not.toHaveAttribute('open')

  await items.nth(1).locator('summary').click()
  await expect(items.nth(1)).toHaveAttribute('open', '')
  await items.nth(0).locator('summary').click()
  await expect(items.nth(0)).not.toHaveAttribute('open')

  await items.nth(1).locator('summary').focus()
  await page.keyboard.press('Enter')
  await expect(items.nth(1)).not.toHaveAttribute('open')
})

test('unknown course slugs answer 404, also on a repeat visit', async ({ request }) => {
  for (const attempt of [1, 2]) {
    const response = await request.get('/kurse/gibt-es-nicht/')
    expect(response.status(), `attempt ${attempt}`).toBe(404)
  }
})

test('a repeat load of a course page is a cache hit', async ({ request }) => {
  await request.get('/kurse/rad-yoga/')
  const second = await request.get('/kurse/rad-yoga/')
  expect(second.status()).toBe(200)
  expect(second.headers()['x-nextjs-cache']).toBe('HIT')
})

test.describe('course schedule', () => {
  test.describe.configure({ mode: 'serial' })

  test('is hidden while empty and shown once times are published', async ({ page, request }) => {
    const path = `/kurse/${SCHEDULE_SLUG}/`
    await page.goto(path)
    await expect(page.getByText('Kurszeiten', { exact: true })).toHaveCount(0)

    const headers = await login(request)
    const id = await courseId(request, headers, SCHEDULE_SLUG)
    try {
      const publish = await request.patch(`/api/courses/${id}`, {
        headers,
        data: {
          schedule: [{ weekday: 'monday', start: '18:00', end: '19:30' }],
          _status: 'published',
        },
      })
      expect(publish.ok()).toBe(true)

      await expect.poll(async () => (await request.get(path)).text()).toContain('18:00–19:30')
      await page.goto(path)
      const trial = page.getByRole('region', { name: /Probestunde/ })
      await expect(trial.getByText('Kurszeiten', { exact: true })).toBeVisible()
      await expect(trial.getByText('Montag')).toBeVisible()
    } finally {
      const restore = await request.patch(`/api/courses/${id}`, {
        headers,
        data: { schedule: [], _status: 'published' },
      })
      expect(restore.ok()).toBe(true)
    }
    await expect.poll(async () => (await request.get(path)).text()).not.toContain('18:00–19:30')
  })
})
