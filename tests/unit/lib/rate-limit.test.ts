import { describe, expect, it } from 'vitest'

import { createRateLimiter } from '@/lib/rateLimit'

function clock(start = 0) {
  let time = start
  return { now: () => time, advance: (ms: number) => (time += ms) }
}

describe('createRateLimiter', () => {
  it('allows up to the limit inside one window, then refuses with a retry hint', () => {
    const time = clock(1_000)
    const limiter = createRateLimiter({ limit: 3, windowMs: 60_000, now: time.now })
    expect(limiter.tryAcquire()).toEqual({ allowed: true })
    time.advance(10_000)
    expect(limiter.tryAcquire()).toEqual({ allowed: true })
    expect(limiter.tryAcquire()).toEqual({ allowed: true })
    // The oldest attempt leaves the window 50 s from now.
    expect(limiter.tryAcquire()).toEqual({ allowed: false, retryAfterSeconds: 50 })
  })

  it('frees a slot once the oldest attempt leaves the window (sliding, not fixed)', () => {
    const time = clock()
    const limiter = createRateLimiter({ limit: 2, windowMs: 1_000, now: time.now })
    limiter.tryAcquire()
    time.advance(600)
    limiter.tryAcquire()
    expect(limiter.tryAcquire().allowed).toBe(false)
    time.advance(400) // first attempt is now exactly windowMs old
    expect(limiter.tryAcquire().allowed).toBe(true)
    expect(limiter.tryAcquire().allowed).toBe(false)
  })

  it('does not count refused attempts, so a steady flood cannot lock it out forever', () => {
    const time = clock()
    const limiter = createRateLimiter({ limit: 1, windowMs: 1_000, now: time.now })
    limiter.tryAcquire()
    for (let i = 0; i < 10; i += 1) {
      time.advance(90)
      expect(limiter.tryAcquire().allowed).toBe(false)
    }
    time.advance(100)
    expect(limiter.tryAcquire().allowed).toBe(true)
  })

  it('never suggests waiting less than one second', () => {
    const time = clock()
    const limiter = createRateLimiter({ limit: 1, windowMs: 1_000, now: time.now })
    limiter.tryAcquire()
    time.advance(999)
    expect(limiter.tryAcquire()).toEqual({ allowed: false, retryAfterSeconds: 1 })
  })

  it('rejects nonsensical options', () => {
    expect(() => createRateLimiter({ limit: 0, windowMs: 1_000 })).toThrow()
    expect(() => createRateLimiter({ limit: 1.5, windowMs: 1_000 })).toThrow()
    expect(() => createRateLimiter({ limit: 1, windowMs: 0 })).toThrow()
  })
})
