import type { RateLimiter } from './rateLimit'
import { secretsMatch } from './secrets'

/**
 * POST /next/refresh/: marks every cached page and content entry stale and answers with the
 * URLs to warm up. The container's start script calls it once the server is up (docs/PLAN.md
 * "Hosting"): the page cache lives only in memory, so after a restart Next would otherwise serve
 * the HTML prerendered at build time, which CI renders from an empty database.
 *
 * The logic lives here, with its dependencies passed in, so unit tests can drive it without Next.
 */

export type LogLevel = 'info' | 'error'

export interface CacheRefreshDeps {
  /** The shared secret; unset keeps the route closed. Read per request, from env. */
  getSecret: () => string | undefined
  limiter: RateLimiter
  /** Marks everything stale (revalidatePath + revalidateTag in the route). */
  refresh: () => void
  /** Public paths to warm up afterwards. */
  listPaths: () => Promise<string[]>
  log: (level: LogLevel, message: string) => void
}

const NO_STORE = { 'Cache-Control': 'no-store' } as const

function json(body: unknown, status: number, headers: Record<string, string> = {}): Response {
  return Response.json(body, { status, headers: { ...NO_STORE, ...headers } })
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}

/** The configured secret, or the error that reading the env threw. */
function readSecret(deps: CacheRefreshDeps): string | undefined | Error {
  try {
    return deps.getSecret()
  } catch (error) {
    return error instanceof Error ? error : new Error(String(error))
  }
}

/** The token of an `Authorization: Bearer <token>` header, or null. */
export function bearerToken(header: string | null): string | null {
  const match = /^Bearer[ ]+(\S+)[ ]*$/i.exec(header ?? '')
  return match?.[1] ?? null
}

export function createCacheRefreshHandler(
  deps: CacheRefreshDeps,
): (request: Request) => Promise<Response> {
  return async (request) => {
    const secret = readSecret(deps)
    if (secret instanceof Error) {
      // An invalid env: the caller can't be checked, so nobody gets in.
      deps.log('error', `Cache refresh unavailable: ${secret.message}`)
      return json({ error: 'refresh failed' }, 500)
    }
    // Unconfigured: answer like any unknown URL.
    if (!secret) return json({ error: 'not found' }, 404)

    // Counted before the secret check, so guessing is rate-limited too. Callers without the
    // secret can use up the budget, but they can't delay the start-up refresh: the container
    // opens its public port only after that refresh (docker/start.mjs).
    const limit = deps.limiter.tryAcquire()
    if (!limit.allowed) {
      return json({ error: 'too many requests' }, 429, {
        'Retry-After': String(limit.retryAfterSeconds),
      })
    }

    if (!secretsMatch(bearerToken(request.headers.get('authorization')), secret)) {
      deps.log('error', 'Cache refresh refused: missing or wrong secret.')
      return json({ error: 'unauthorized' }, 401)
    }

    try {
      deps.refresh()
      const paths = await deps.listPaths()
      deps.log('info', `Cache refreshed; ${paths.length} paths to warm up.`)
      return json({ refreshed: true, paths }, 200)
    } catch (error) {
      deps.log('error', `Cache refresh failed: ${errorMessage(error)}`)
      return json({ error: 'refresh failed' }, 500)
    }
  }
}
