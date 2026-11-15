/**
 * In-memory sliding-window rate limiter for one server process. Behind a proxy every request
 * comes from the proxy's address, so the limit is shared by all callers, not kept per IP.
 */

export type RateLimitResult = { allowed: true } | { allowed: false; retryAfterSeconds: number }

export interface RateLimiter {
  /** Counts one attempt and says whether it is within the limit. */
  tryAcquire(): RateLimitResult
}

export interface RateLimiterOptions {
  /** Attempts allowed per window. */
  limit: number
  windowMs: number
  /** Clock, injectable for tests. */
  now?: () => number
}

export function createRateLimiter({
  limit,
  windowMs,
  now = Date.now,
}: RateLimiterOptions): RateLimiter {
  if (!Number.isInteger(limit) || limit < 1) throw new Error('limit must be a positive integer')
  if (!(windowMs > 0)) throw new Error('windowMs must be positive')

  // Timestamps of the attempts inside the current window, oldest first.
  let attempts: readonly number[] = []

  return {
    tryAcquire() {
      const time = now()
      const recent = attempts.filter((at) => time - at < windowMs)
      if (recent.length >= limit) {
        attempts = recent
        const oldest = recent[0] ?? time
        return {
          allowed: false,
          retryAfterSeconds: Math.max(1, Math.ceil((oldest + windowMs - time) / 1000)),
        }
      }
      attempts = [...recent, time]
      return { allowed: true }
    },
  }
}
