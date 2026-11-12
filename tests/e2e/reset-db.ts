import nextEnv from '@next/env'

import { assertTestDatabase } from '../setup/testDatabase'

/**
 * Empties the test database before the E2E seed, so leftovers from the integration suites
 * (extra courses, a second trial group) never leak into the pages under test.
 * Run with NODE_ENV=test so @next/env loads .env.test.
 */
async function main(): Promise<void> {
  if (process.env.NODE_ENV !== 'test') throw new Error('Run reset-db with NODE_ENV=test.')
  nextEnv.loadEnvConfig(process.cwd())
  assertTestDatabase()
  const { closePayload, getTestPayload, wipeCollections } = await import('../int/helpers')
  const payload = await getTestPayload()
  try {
    await wipeCollections(payload)
    payload.logger.info('Test database emptied')
  } finally {
    await closePayload(payload)
  }
}

main().then(
  () => process.exit(0),
  (error: unknown) => {
    console.error(error)
    process.exit(1)
  },
)
