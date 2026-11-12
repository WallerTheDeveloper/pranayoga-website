import { existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import nextEnv from '@next/env'

import { assertSeedTarget } from './guard'

/**
 * `pnpm seed` loads .env; `NODE_ENV=test pnpm seed` loads .env.test (the test database). Env is
 * loaded before the Payload config is imported, because the config validates it at import time.
 */
const projectDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

function loadEnv(): void {
  if (process.env.NODE_ENV === 'test' && !existsSync(path.join(projectDir, '.env.test'))) {
    // Without this check @next/env would fall back to .env and seed the dev database.
    throw new Error('NODE_ENV=test needs a .env.test file (see .env.test.example).')
  }
  nextEnv.loadEnvConfig(projectDir, process.env.NODE_ENV !== 'test')
  assertSeedTarget({
    nodeEnv: process.env.NODE_ENV,
    databaseUri: process.env.DATABASE_URI,
    allowRemoteDb: process.env.SEED_ALLOW_REMOTE_DB,
  })
}

async function main(): Promise<void> {
  loadEnv()
  const { runSeed } = await import('./run')
  await runSeed(projectDir)
}

main().then(
  () => process.exit(0),
  (error: unknown) => {
    console.error(error instanceof Error ? (error.stack ?? error.message) : error)
    process.exit(1)
  },
)
