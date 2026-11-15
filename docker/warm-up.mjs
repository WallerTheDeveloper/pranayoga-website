/**
 * Startup steps run by docker/start.mjs inside the container, against the server on localhost
 * (the shared login sits in the proxy, so it doesn't get in the way):
 *   1. wait until /next/health/ answers 200 (the database is up, migrations have run);
 *   2. POST /next/refresh/, which marks every cached page stale and lists the public URLs;
 *   3. request each URL once, so visitors get cached pages.
 *
 * Plain JavaScript without dependencies: the image has no TypeScript tooling. Fetch, sleep and
 * the clock are passed in so tests can drive every step.
 *
 * @typedef {(input: string, init?: RequestInit) => Promise<Response>} FetchLike
 * @typedef {(ms: number) => Promise<unknown>} Sleep
 * @typedef {(message: string) => void} Log
 */
import { tmpdir } from 'node:os'
import path from 'node:path'

/** Written once the refresh succeeded; docker/healthcheck.mjs reports healthy only after that. */
export const READY_FILE = path.join(tmpdir(), 'pranayoga-ready')

const HEALTH_PATH = '/next/health/'
const REFRESH_PATH = '/next/refresh/'

// A segment is words joined by single dots; segments are separated by single slashes. Every
// repetition is anchored by a slash or dot, so matching stays linear.
const SEGMENT = '[A-Za-z0-9_~-]+(?:\\.[A-Za-z0-9_~-]+)*'
const WARM_UP_PATH = new RegExp(`^/(?:${SEGMENT}/)*(?:${SEGMENT})?$`)

/**
 * A same-origin path we are willing to request: one leading slash, then only URL-safe
 * characters. Rules out `//host`, `@host`, schemes, queries and dot segments.
 *
 * @param {unknown} path
 * @returns {path is string}
 */
export function isWarmUpPath(path) {
  return typeof path === 'string' && path.length <= 200 && WARM_UP_PATH.test(path)
}

/**
 * @param {{ origin: string, fetch: FetchLike, sleep: Sleep, now?: () => number,
 *   timeoutMs?: number, intervalMs?: number }} options
 */
export async function waitForHealth({
  origin,
  fetch,
  sleep,
  now = Date.now,
  timeoutMs = 300_000,
  intervalMs = 2_000,
}) {
  const deadline = now() + timeoutMs
  while (now() < deadline) {
    try {
      const response = await fetch(`${origin}${HEALTH_PATH}`, {
        signal: AbortSignal.timeout(10_000),
      })
      if (response.ok) return
    } catch {
      // Not listening yet, or Payload is still starting: try again.
    }
    await sleep(intervalMs)
  }
  throw new Error(`${HEALTH_PATH} did not answer 200 within ${Math.round(timeoutMs / 1000)} s`)
}

/**
 * @param {Response} response
 * @param {number} attempt
 */
function retryDelayMs(response, attempt) {
  const retryAfter = Number(response.headers.get('retry-after'))
  if (Number.isFinite(retryAfter) && retryAfter > 0) return Math.min(retryAfter, 120) * 1000
  return Math.min(2 ** attempt, 30) * 1000
}

/**
 * Calls the refresh route and returns the paths to warm up. Retries on 429 and 5xx; a 401 or 404
 * means the secret is wrong or missing, which no retry fixes.
 *
 * @param {{ origin: string, secret: string, fetch: FetchLike, sleep: Sleep, attempts?: number }} options
 * @returns {Promise<string[]>}
 */
export async function requestRefresh({ origin, secret, fetch, sleep, attempts = 5 }) {
  let lastProblem = 'no attempt made'
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    let response
    try {
      response = await fetch(`${origin}${REFRESH_PATH}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${secret}` },
        signal: AbortSignal.timeout(30_000),
      })
    } catch (error) {
      lastProblem = error instanceof Error ? error.message : String(error)
      await sleep(Math.min(2 ** attempt, 30) * 1000)
      continue
    }
    if (response.ok) {
      const body = await response.json()
      const paths = Array.isArray(body?.paths) ? body.paths.filter(isWarmUpPath) : []
      if (paths.length === 0) throw new Error(`${REFRESH_PATH} answered without paths`)
      return paths
    }
    if (response.status === 401 || response.status === 404) {
      throw new Error(
        `${REFRESH_PATH} answered ${response.status}: check CACHE_REFRESH_SECRET in the app's env`,
      )
    }
    lastProblem = `HTTP ${response.status}`
    await sleep(retryDelayMs(response, attempt))
  }
  throw new Error(`${REFRESH_PATH} failed after ${attempts} attempts (${lastProblem})`)
}

/**
 * Requests each path once, one after another (gentle on a small server). Redirects are not
 * followed; 2xx and 3xx count as warm.
 *
 * @param {{ origin: string, paths: readonly string[], fetch: FetchLike }} options
 * @returns {Promise<{ warmed: number, failed: string[] }>}
 */
export async function warmUp({ origin, paths, fetch }) {
  let warmed = 0
  /** @type {string[]} */
  const failed = []
  for (const path of paths) {
    try {
      const response = await fetch(`${origin}${path}`, {
        redirect: 'manual',
        signal: AbortSignal.timeout(60_000),
      })
      await response.arrayBuffer()
      if (response.status < 400) warmed += 1
      else failed.push(`${path} (HTTP ${response.status})`)
    } catch (error) {
      failed.push(`${path} (${error instanceof Error ? error.message : String(error)})`)
    }
  }
  return { warmed, failed }
}

/**
 * The whole sequence. Throws when the server never gets healthy or the refresh fails: then the
 * server must not stay up, or it would serve the HTML prerendered at build time. A page that
 * fails to warm up is only logged; it renders on its first visit instead.
 *
 * `onRefreshed` runs between the refresh and the warm-up: the start script opens the public port
 * there, because from then on every page renders from the database.
 *
 * @param {{
 *   origin: string, secret: string, fetch: FetchLike, sleep: Sleep, log: Log,
 *   onRefreshed?: () => Promise<void>,
 * }} options
 */
export async function runStartup({ origin, secret, fetch, sleep, log, onRefreshed }) {
  await waitForHealth({ origin, fetch, sleep })
  log('server healthy, refreshing the cache')
  const paths = await requestRefresh({ origin, secret, fetch, sleep })
  await onRefreshed?.()
  const { warmed, failed } = await warmUp({ origin, paths, fetch })
  log(`warm-up done: ${warmed} of ${paths.length} pages cached`)
  if (failed.length > 0) log(`warm-up failures: ${failed.join(', ')}`)
  return { warmed, failed }
}
