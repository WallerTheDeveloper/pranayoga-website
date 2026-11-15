/**
 * Docker HEALTHCHECK: healthy once the startup refresh has run (READY_FILE) and the server
 * still answers /next/health/ with 200. deploy.sh waits for this state.
 */
import { existsSync } from 'node:fs'

import { READY_FILE } from './warm-up.mjs'

const port = process.env.PORT?.trim() || '3000'

if (!existsSync(READY_FILE)) process.exit(1)

try {
  const response = await fetch(`http://127.0.0.1:${port}/next/health/`, {
    signal: AbortSignal.timeout(5_000),
  })
  process.exit(response.ok ? 0 : 1)
} catch {
  process.exit(1)
}
