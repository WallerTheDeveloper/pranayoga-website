import { describe, expect, it, vi } from 'vitest'

import {
  isWarmUpPath,
  requestRefresh,
  runStartup,
  waitForHealth,
  warmUp,
} from '../../../docker/warm-up.mjs'

const ORIGIN = 'http://127.0.0.1:3000'
const SECRET = 's'.repeat(32)
const noSleep = vi.fn(async () => {})

type Answer = Response | Error

/** A fetch that answers from a queue per path, recording each call. */
function fakeFetch(answers: Record<string, Answer[]>) {
  const calls: { url: string; init?: RequestInit }[] = []
  const fetch = vi.fn(async (url: string, init?: RequestInit) => {
    calls.push({ url, init })
    const path = url.slice(ORIGIN.length)
    const next = answers[path]?.shift()
    if (next === undefined) return new Response('not found', { status: 404 })
    if (next instanceof Error) throw next
    return next
  })
  return { fetch, calls }
}

const ok = (body: unknown = { status: 'ok' }) => Response.json(body)

describe('isWarmUpPath', () => {
  it('accepts our page, robots and sitemap paths', () => {
    for (const path of ['/', '/kurse/', '/kurse/hatha-yoga/', '/robots.txt', '/sitemap.xml']) {
      expect(isWarmUpPath(path)).toBe(true)
    }
  })

  it('rejects anything that could leave the origin or climb out of it', () => {
    for (const path of [
      '',
      'kurse/',
      '//evil.example/',
      '@evil.example/',
      '/@evil.example',
      '/../admin/',
      '/a/../b',
      '/./',
      '/a?b=c',
      '/a#b',
      '/a\\b',
      'https://evil.example/',
      '/a//b',
      `/${'a'.repeat(200)}`,
      42,
      null,
    ]) {
      expect(isWarmUpPath(path)).toBe(false)
    }
  })

  it('stays fast on long hostile input', () => {
    const started = performance.now()
    isWarmUpPath(`/${'a'.repeat(190)}!`)
    isWarmUpPath(`/${'a.'.repeat(95)}!`)
    expect(performance.now() - started).toBeLessThan(50)
  })
})

describe('waitForHealth', () => {
  it('polls until the health route answers 200', async () => {
    const { fetch } = fakeFetch({
      '/next/health/': [new Error('ECONNREFUSED'), new Response('', { status: 503 }), ok()],
    })
    await waitForHealth({ origin: ORIGIN, fetch, sleep: noSleep })
    expect(fetch).toHaveBeenCalledTimes(3)
  })

  it('gives up after the timeout', async () => {
    let time = 0
    const { fetch } = fakeFetch({})
    const sleep = vi.fn(async (ms: number) => {
      time += ms
    })
    await expect(
      waitForHealth({
        origin: ORIGIN,
        fetch,
        sleep,
        now: () => time,
        timeoutMs: 10_000,
        intervalMs: 2_000,
      }),
    ).rejects.toThrow(/within 10 s/)
    expect(fetch).toHaveBeenCalledTimes(5)
  })
})

describe('requestRefresh', () => {
  it('posts the secret as a bearer token and returns the valid paths only', async () => {
    const { fetch, calls } = fakeFetch({
      '/next/refresh/': [ok({ refreshed: true, paths: ['/', '/kurse/', '//evil.example/', 7] })],
    })
    const paths = await requestRefresh({ origin: ORIGIN, secret: SECRET, fetch, sleep: noSleep })
    expect(paths).toEqual(['/', '/kurse/'])
    expect(calls[0]?.init?.method).toBe('POST')
    expect(new Headers(calls[0]?.init?.headers).get('authorization')).toBe(`Bearer ${SECRET}`)
  })

  it('retries on 429 (honouring Retry-After), 5xx and network errors', async () => {
    const sleep = vi.fn(async () => {})
    const { fetch } = fakeFetch({
      '/next/refresh/': [
        new Response('', { status: 429, headers: { 'Retry-After': '7' } }),
        new Response('', { status: 500 }),
        new Error('socket hang up'),
        ok({ paths: ['/'] }),
      ],
    })
    expect(await requestRefresh({ origin: ORIGIN, secret: SECRET, fetch, sleep })).toEqual(['/'])
    expect(sleep).toHaveBeenNthCalledWith(1, 7_000)
    expect(fetch).toHaveBeenCalledTimes(4)
  })

  it('stops at once on 401 or 404: a wrong or missing secret needs a fix, not a retry', async () => {
    for (const status of [401, 404]) {
      const { fetch } = fakeFetch({ '/next/refresh/': [new Response('', { status })] })
      await expect(
        requestRefresh({ origin: ORIGIN, secret: SECRET, fetch, sleep: noSleep }),
      ).rejects.toThrow(/CACHE_REFRESH_SECRET/)
      expect(fetch).toHaveBeenCalledOnce()
    }
  })

  it('fails after the last attempt', async () => {
    const { fetch } = fakeFetch({
      '/next/refresh/': [new Response('', { status: 503 }), new Response('', { status: 503 })],
    })
    await expect(
      requestRefresh({ origin: ORIGIN, secret: SECRET, fetch, sleep: noSleep, attempts: 2 }),
    ).rejects.toThrow(/after 2 attempts \(HTTP 503\)/)
  })

  it('fails when the answer lists no usable path', async () => {
    const { fetch } = fakeFetch({ '/next/refresh/': [ok({ paths: ['//evil.example/'] })] })
    await expect(
      requestRefresh({ origin: ORIGIN, secret: SECRET, fetch, sleep: noSleep }),
    ).rejects.toThrow(/without paths/)
  })
})

describe('warmUp', () => {
  it('requests each path once, in order, without following redirects', async () => {
    const { fetch, calls } = fakeFetch({
      '/': [new Response('home')],
      '/kurse/': [new Response('', { status: 308, headers: { location: '/x/' } })],
      '/kontakt/': [new Response('', { status: 500 })],
      '/impressum/': [new Error('timeout')],
    })
    const result = await warmUp({
      origin: ORIGIN,
      paths: ['/', '/kurse/', '/kontakt/', '/impressum/'],
      fetch,
    })
    expect(calls.map((call) => call.url)).toEqual([
      `${ORIGIN}/`,
      `${ORIGIN}/kurse/`,
      `${ORIGIN}/kontakt/`,
      `${ORIGIN}/impressum/`,
    ])
    expect(calls.every((call) => call.init?.redirect === 'manual')).toBe(true)
    expect(result).toEqual({
      warmed: 2,
      failed: ['/kontakt/ (HTTP 500)', '/impressum/ (timeout)'],
    })
  })
})

describe('runStartup', () => {
  it('waits for health, refreshes, warms up and reports', async () => {
    const log = vi.fn()
    const { fetch } = fakeFetch({
      '/next/health/': [ok()],
      '/next/refresh/': [ok({ paths: ['/', '/kurse/'] })],
      '/': [new Response('home')],
      '/kurse/': [new Response('', { status: 500 })],
    })
    const result = await runStartup({ origin: ORIGIN, secret: SECRET, fetch, sleep: noSleep, log })
    expect(result).toEqual({ warmed: 1, failed: ['/kurse/ (HTTP 500)'] })
    expect(log).toHaveBeenCalledWith('warm-up done: 1 of 2 pages cached')
    expect(log).toHaveBeenCalledWith('warm-up failures: /kurse/ (HTTP 500)')
  })

  it('calls onRefreshed after the refresh and before the warm-up', async () => {
    const steps: string[] = []
    const { fetch } = fakeFetch({
      '/next/health/': [ok()],
      '/next/refresh/': [ok({ paths: ['/'] })],
      '/': [new Response('home')],
    })
    const tracingFetch = async (url: string, init?: RequestInit): Promise<Response> => {
      steps.push(`fetch ${new URL(url).pathname}`)
      return fetch(url, init)
    }
    await runStartup({
      origin: ORIGIN,
      secret: SECRET,
      fetch: tracingFetch,
      sleep: noSleep,
      log: vi.fn(),
      onRefreshed: async () => {
        steps.push('onRefreshed')
      },
    })
    expect(steps).toEqual(['fetch /next/health/', 'fetch /next/refresh/', 'onRefreshed', 'fetch /'])
  })

  it('does not call onRefreshed when the refresh fails', async () => {
    const onRefreshed = vi.fn(async () => {})
    const { fetch } = fakeFetch({
      '/next/health/': [ok()],
      '/next/refresh/': [new Response('', { status: 401 })],
    })
    await expect(
      runStartup({
        origin: ORIGIN,
        secret: SECRET,
        fetch,
        sleep: noSleep,
        log: vi.fn(),
        onRefreshed,
      }),
    ).rejects.toThrow(/401/)
    expect(onRefreshed).not.toHaveBeenCalled()
  })

  it('throws when the refresh fails, so the start script can stop the server', async () => {
    const { fetch } = fakeFetch({
      '/next/health/': [ok()],
      '/next/refresh/': [new Response('', { status: 401 })],
    })
    await expect(
      runStartup({ origin: ORIGIN, secret: SECRET, fetch, sleep: noSleep, log: vi.fn() }),
    ).rejects.toThrow(/401/)
  })
})
