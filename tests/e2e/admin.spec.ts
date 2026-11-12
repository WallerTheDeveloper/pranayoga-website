import { expect, test, type APIRequestContext, type Page } from '@playwright/test'

import { E2E_ADMIN } from './constants'

/**
 * Editor flows in the real admin UI. The URL slug comes from the title until the first publish:
 * the admin autosaves a new course before its title is typed, which once left the slug empty and
 * blocked publishing. Courses created here are deleted again, so the other suites see six.
 */

const TITLE_PREFIX = 'E2E Kurs'

async function logIn(page: Page): Promise<void> {
  await page.goto('/admin/login/')
  await page.locator('#field-email').fill(E2E_ADMIN.email)
  await page.locator('#field-password').fill(E2E_ADMIN.password)
  await page.locator('button[type="submit"]').click()
  await expect(page.locator('#field-email')).toHaveCount(0)
}

async function deleteTestCourses(request: APIRequestContext): Promise<void> {
  const login = await request.post('/api/users/login/', { data: E2E_ADMIN })
  const { token } = (await login.json()) as { token: string }
  const headers = { Authorization: `JWT ${token}` }
  const found = await request.get('/api/courses/', {
    headers,
    params: { 'where[title][like]': TITLE_PREFIX, draft: 'true', depth: '0', limit: '50' },
  })
  const { docs } = (await found.json()) as { docs: { id: number }[] }
  for (const doc of docs) {
    await request.delete(`/api/courses/${doc.id}/`, { headers })
  }
}

test.describe.configure({ mode: 'serial' })

test.afterAll(async ({ request }) => {
  await deleteTestCourses(request)
})

test('a new course takes its slug from the title and the slug never blocks publishing', async ({
  page,
}) => {
  await logIn(page)
  await page.goto('/admin/collections/courses/create/')
  await page.locator('#field-title').fill(`${TITLE_PREFIX} Abend`)

  const slug = page.locator('#field-slug')
  await expect(slug).toBeDisabled()
  await expect(slug).toHaveValue('e2e-kurs-abend', { timeout: 15_000 })

  // Other required fields are still empty, so publishing fails, but not because of the slug.
  await page.locator('#action-save').click()
  const error = page.locator('.toast-error')
  await expect(error).toContainText('Symbol')
  await expect(error).not.toContainText('URL-Kürzel')
})

test('a duplicated course publishes under the URL made from its new title', async ({
  page,
  request,
}) => {
  await logIn(page)
  await page.goto('/admin/collections/courses/')
  await page.locator('table a', { hasText: /^Rad Yoga$/ }).click()
  await expect(page.locator('#field-slug')).toHaveValue('rad-yoga')

  await page.locator('.doc-controls .popup-button').click()
  await page.locator('#action-duplicate').click()
  await expect(page.locator('#field-slug')).toHaveValue('rad-yoga-copy', { timeout: 15_000 })

  await page.locator('#field-title').fill(`${TITLE_PREFIX} Rad am Morgen`)
  await expect(page.locator('#field-slug')).toHaveValue('e2e-kurs-rad-am-morgen', {
    timeout: 15_000,
  })
  await page.locator('#action-save').click()
  await expect(page.locator('.toast-error')).toHaveCount(0)

  await expect
    .poll(async () => (await request.get('/kurse/e2e-kurs-rad-am-morgen/')).status(), {
      timeout: 15_000,
    })
    .toBe(200)
})
