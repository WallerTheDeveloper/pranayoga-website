import { describe, expect, it, vi } from 'vitest'

import { bearerToken, createCacheRefreshHandler, type CacheRefreshDeps } from '@/lib/cacheRefresh'
import { createRateLimiter, type RateLimiter } from '@/lib/rateLimit'

const SECRET = 's'.repeat(32)

function setup(overrides: Partial<CacheRefreshDeps> = {}) {
  const deps: CacheRefreshDeps = {
    getSecret: () => SECRET,
    limiter: createRateLimiter({ limit: 5, windowMs: 60_000 }),
    refresh: vi.fn(),
    listPaths: vi.fn(async () => ['/', '/kurse/']),
    log: vi.fn(),
    ...overrides,
  }
  return { deps, handle: createCacheRefreshHandler(deps) }
}

function post(authorization?: string): Request {
  const headers = authorization === undefined ? undefined : { authorization }
  return new Request('http://127.0.0.1:3000/next/refresh/', { method: 'POST', headers })
}

describe('bearerToken', () => {
  it('reads the token of a Bearer header, case-insensitively', () => {
    expect(bearerToken('Bearer abc')).toBe('abc')
    expect(bearerToken('bearer abc')).toBe('abc')
  })

  it('returns null for anything else', () => {
    expect(bearerToken(null)).toBeNull()
    expect(bearerToken('')).toBeNull()
    expect(bearerToken('Basic dXNlcjpwYXNz')).toBeNull()
    expect(bearerToken('Bearer')).toBeNull()
    expect(bearerToken('Bearer a b')).toBeNull()
  })
})

describe('createCacheRefreshHandler', () => {
  it('refreshes and returns the warm-up paths for the right secret', async () => {
    const { deps, handle } = setup()
    const response = await handle(post(`Bearer ${SECRET}`))
    expect(response.status).toBe(200)
    expect(response.headers.get('cache-control')).toBe('no-store')
    expect(await response.json()).toEqual({ refreshed: true, paths: ['/', '/kurse/'] })
    expect(deps.refresh).toHaveBeenCalledOnce()
  })

  it('refuses a wrong or missing secret without refreshing', async () => {
    const { deps, handle } = setup()
    for (const header of [undefined, 'Bearer wrong-secret', `Basic ${SECRET}`, SECRET]) {
      const response = await handle(post(header))
      expect(response.status).toBe(401)
    }
    expect(deps.refresh).not.toHaveBeenCalled()
    expect(deps.listPaths).not.toHaveBeenCalled()
  })

  it('stays closed (404) while no secret is configured, whatever the request says', async () => {
    const { deps, handle } = setup({ getSecret: () => undefined })
    expect((await handle(post('Bearer '))).status).toBe(404)
    expect((await handle(post(`Bearer ${SECRET}`))).status).toBe(404)
    expect(deps.refresh).not.toHaveBeenCalled()
  })

  it('rate-limits every attempt, guesses included, with Retry-After', async () => {
    const { deps, handle } = setup({ limiter: createRateLimiter({ limit: 2, windowMs: 60_000 }) })
    expect((await handle(post('Bearer guess-1'))).status).toBe(401)
    expect((await handle(post('Bearer guess-2'))).status).toBe(401)
    const limited = await handle(post(`Bearer ${SECRET}`))
    expect(limited.status).toBe(429)
    expect(Number(limited.headers.get('retry-after'))).toBeGreaterThan(0)
    expect(deps.refresh).not.toHaveBeenCalled()
  })

  it('checks the limit before the secret', async () => {
    const limiter: RateLimiter = { tryAcquire: () => ({ allowed: false, retryAfterSeconds: 7 }) }
    const { handle } = setup({ limiter })
    const response = await handle(post(`Bearer ${SECRET}`))
    expect(response.status).toBe(429)
    expect(response.headers.get('retry-after')).toBe('7')
  })

  it('answers 500 and logs when the refresh throws, without leaking the error', async () => {
    const { deps, handle } = setup({
      listPaths: async () => {
        throw new Error('database password wrong')
      },
    })
    const response = await handle(post(`Bearer ${SECRET}`))
    expect(response.status).toBe(500)
    expect(await response.text()).not.toMatch(/password/)
    expect(deps.log).toHaveBeenCalledWith('error', expect.stringMatching(/password wrong/))
  })

  it('answers 500 and logs when reading the env throws, without refreshing', async () => {
    const { deps, handle } = setup({
      getSecret: () => {
        throw new Error('Invalid environment: PAYLOAD_SECRET is missing')
      },
    })
    const response = await handle(post(`Bearer ${SECRET}`))
    expect(response.status).toBe(500)
    expect(response.headers.get('cache-control')).toBe('no-store')
    expect(await response.text()).not.toMatch(/PAYLOAD_SECRET/)
    expect(deps.refresh).not.toHaveBeenCalled()
    expect(deps.log).toHaveBeenCalledWith('error', expect.stringMatching(/PAYLOAD_SECRET/))
  })

  it('reads the secret per request, so a changed env needs no new handler', async () => {
    const env: { secret?: string } = {}
    const { handle } = setup({ getSecret: () => env.secret })
    expect((await handle(post(`Bearer ${SECRET}`))).status).toBe(404)
    env.secret = SECRET
    expect((await handle(post(`Bearer ${SECRET}`))).status).toBe(200)
  })
})
