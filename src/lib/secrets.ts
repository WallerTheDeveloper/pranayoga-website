import { createHash, timingSafeEqual } from 'node:crypto'

/**
 * Constant-time string comparison. Both sides are hashed first, so differing lengths don't leak
 * through an early return.
 */
export function secretsMatch(received: string | null | undefined, expected: string): boolean {
  if (typeof received !== 'string' || received.length === 0 || expected.length === 0) return false
  const a = createHash('sha256').update(received).digest()
  const b = createHash('sha256').update(expected).digest()
  return timingSafeEqual(a, b)
}
