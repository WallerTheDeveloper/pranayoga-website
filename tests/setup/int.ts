import nextEnv from '@next/env'
import { vi } from 'vitest'

import { assertTestDatabase } from './testDatabase'

/**
 * Integration tests run against the docker compose "db-test" database. Vitest sets NODE_ENV=test,
 * so @next/env loads .env.test. The guard below refuses any database whose name doesn't end in
 * `_test`, because the suites wipe collections.
 */
nextEnv.loadEnvConfig(process.cwd())
assertTestDatabase()

// Outside a Next request there is no cache or request store: tag revalidation is recorded and
// unstable_cache runs the loader directly.
vi.mock('next/cache', () => ({
  revalidateTag: vi.fn(),
  unstable_cache: vi.fn(
    <T extends (...args: never[]) => unknown>(load: T) =>
      (...args: Parameters<T>) =>
        load(...args),
  ),
}))

vi.mock('next/headers', async () => {
  const { nextState } = await import('./nextState')
  return {
    draftMode: async () => ({ isEnabled: nextState.draftMode }),
    headers: async () => nextState.headers,
  }
})
