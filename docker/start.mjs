/**
 * Container entry point: starts Next's standalone server in this process, then refreshes and
 * warms the cache (docker/warm-up.mjs). One process, not a parent plus a child: on the 1 GB
 * staging droplet a second Node process would cost ~55 MB for the container's whole life.
 * Next's server handles SIGTERM itself; compose runs an init process (`init: true`) as PID 1.
 *
 * Next listens on an internal port on the container's loopback only. The public port (PORT,
 * published by compose) opens after the refresh (docker/forward.mjs), so no visitor ever gets the
 * pages prerendered at build time, and nobody outside the container can reach the refresh route
 * before the start-up refresh has used it. If the refresh fails, the process exits with code 1
 * and Docker restarts the container.
 */
import { rmSync, writeFileSync } from 'node:fs'
import { setTimeout as sleep } from 'node:timers/promises'

import { forwardTcp, parsePort } from './forward.mjs'
import { READY_FILE, runStartup } from './warm-up.mjs'

/** @param {string} message */
const log = (message) => console.log(`[start] ${message}`)

/** @param {string} message */
function fail(message) {
  console.error(`[start] ${message}`)
  process.exit(1)
}

const secret = process.env.CACHE_REFRESH_SECRET?.trim() ?? ''
if (secret.length < 24) fail('CACHE_REFRESH_SECRET is missing or shorter than 24 characters.')

/** @type {number} */
let publicPort = 0
/** @type {number} */
let internalPort = 0
try {
  publicPort = parsePort(process.env.PORT, 3000)
  internalPort = parsePort(process.env.INTERNAL_PORT, 3001)
} catch (error) {
  fail(error instanceof Error ? error.message : String(error))
}
if (publicPort === internalPort) fail('PORT and INTERNAL_PORT must differ.')

// A restarted container keeps its /tmp: drop the marker of the previous run.
rmSync(READY_FILE, { force: true })

// Read by server.js. Docker sets HOSTNAME to the container id, so it is always overridden.
process.env.HOSTNAME = '127.0.0.1'
process.env.PORT = String(internalPort)

// Next's standalone server starts listening as soon as it is loaded.
await import('../server.js')

const internalOrigin = `http://127.0.0.1:${internalPort}`
const openPublicPort = async () => {
  await forwardTcp({
    listen: { host: '0.0.0.0', port: publicPort },
    target: { host: '127.0.0.1', port: internalPort },
    onError: (message) => console.error(`[start] ${message}`),
  })
  log(`public port ${publicPort} open`)
}

try {
  await runStartup({
    origin: internalOrigin,
    secret,
    fetch,
    sleep,
    log,
    onRefreshed: openPublicPort,
  })
  writeFileSync(READY_FILE, new Date().toISOString())
  log('ready')
} catch (error) {
  console.error(`[start] ${error instanceof Error ? error.message : String(error)}`)
  console.error('[start] stopping: the server would serve the pages prerendered at build time.')
  process.exit(1)
}
