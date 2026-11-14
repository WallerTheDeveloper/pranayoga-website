import { expect, test, type APIRequestContext } from '@playwright/test'

import { login } from './admin-api'

/**
 * Publishing in the admin shows on the next page load; draft saves don't; repeat loads come from
 * the cache. Uses the REST API as the seeded admin and restores the review afterwards.
 */

interface ReviewDoc {
  id: number
  text: string
}

async function findReview(
  request: APIRequestContext,
  headers: Record<string, string>,
): Promise<ReviewDoc> {
  const response = await request.get('/api/reviews', {
    headers,
    params: { 'where[author][equals]': 'Alex', limit: '1', depth: '0' },
  })
  expect(response.ok()).toBe(true)
  const { docs } = (await response.json()) as { docs: ReviewDoc[] }
  const review = docs[0]
  if (!review) throw new Error('Seeded review "Alex" not found')
  return review
}

async function homeHtml(request: APIRequestContext) {
  const response = await request.get('/')
  expect(response.status()).toBe(200)
  return { html: await response.text(), cache: response.headers()['x-nextjs-cache'] }
}

test.describe.configure({ mode: 'serial' })

test('a repeat load of the home page is a cache hit', async ({ request }) => {
  await homeHtml(request)
  const second = await homeHtml(request)
  expect(second.cache).toBe('HIT')
})

test('publishing shows on the next load, a draft save does not', async ({ request }) => {
  const headers = await login(request)
  const review = await findReview(request, headers)
  const published = `Veröffentlicht ${Date.now()}`
  const draft = `Nur Entwurf ${Date.now()}`

  try {
    const publish = await request.patch(`/api/reviews/${review.id}`, {
      headers,
      data: { text: published, _status: 'published' },
    })
    expect(publish.ok()).toBe(true)
    await expect.poll(async () => (await homeHtml(request)).html).toContain(published)

    const save = await request.patch(`/api/reviews/${review.id}?draft=true`, {
      headers,
      data: { text: draft },
    })
    expect(save.ok()).toBe(true)
    const after = await homeHtml(request)
    expect(after.html).toContain(published)
    expect(after.html).not.toContain(draft)
  } finally {
    await request.patch(`/api/reviews/${review.id}`, {
      headers,
      data: { text: review.text, _status: 'published' },
    })
  }
})
