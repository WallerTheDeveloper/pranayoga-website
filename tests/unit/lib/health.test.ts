import { describe, expect, it, vi } from 'vitest'

import { createHealthHandler } from '@/lib/health'

describe('createHealthHandler', () => {
  it('answers 200 and no-store when the probe passes', async () => {
    const handle = createHealthHandler(async () => {}, vi.fn())
    const response = await handle()
    expect(response.status).toBe(200)
    expect(response.headers.get('cache-control')).toBe('no-store')
    expect(await response.json()).toEqual({ status: 'ok' })
  })

  it('answers 503 and logs the reason, without putting it in the response', async () => {
    const logError = vi.fn()
    const handle = createHealthHandler(async () => {
      throw new Error('connect ECONNREFUSED 10.0.0.2:5432')
    }, logError)
    const response = await handle()
    expect(response.status).toBe(503)
    expect(response.headers.get('cache-control')).toBe('no-store')
    expect(await response.text()).not.toMatch(/ECONNREFUSED/)
    expect(logError).toHaveBeenCalledWith(expect.stringMatching(/ECONNREFUSED/))
  })
})
