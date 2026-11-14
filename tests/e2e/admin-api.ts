import { expect, type APIRequestContext } from '@playwright/test'

import { E2E_ADMIN } from './constants'

/** REST access as the seeded admin, for specs that change content and restore it afterwards. */

export type AdminHeaders = Record<string, string>

export async function login(request: APIRequestContext): Promise<AdminHeaders> {
  const response = await request.post('/api/users/login', { data: E2E_ADMIN })
  expect(response.ok()).toBe(true)
  const { token } = (await response.json()) as { token: string }
  return { Authorization: `JWT ${token}` }
}

/** Publishes `data` on a global (a partial update: other fields keep their values). */
export async function publishGlobal(
  request: APIRequestContext,
  headers: AdminHeaders,
  slug: string,
  data: Record<string, unknown>,
): Promise<void> {
  const response = await request.post(`/api/globals/${slug}`, {
    headers,
    data: { ...data, _status: 'published' },
  })
  expect(response.ok(), await response.text()).toBe(true)
}
