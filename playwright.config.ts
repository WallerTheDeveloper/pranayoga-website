import { existsSync, readFileSync } from 'node:fs'
import { parseEnv } from 'node:util'

import { defineConfig, devices } from '@playwright/test'

import { E2E_ADMIN, E2E_ORIGIN, E2E_PORT } from './tests/e2e/constants'

/**
 * E2E against a production build on the test database (docker compose "db-test"): the web server
 * seeds it, builds and starts on :3100. Values come from .env.test; env vars already set win.
 */
const testEnvFile = '.env.test'
if (!existsSync(testEnvFile)) {
  throw new Error('E2E needs a .env.test file (see .env.test.example).')
}
const testEnv = parseEnv(readFileSync(testEnvFile, 'utf8'))

const serverEnv: Record<string, string> = {
  ...(testEnv as Record<string, string>),
  NEXT_PUBLIC_SERVER_URL: E2E_ORIGIN,
  SEED_ADMIN_EMAIL: E2E_ADMIN.email,
  SEED_ADMIN_PASSWORD: E2E_ADMIN.password,
  NEXT_TELEMETRY_DISABLED: '1',
}

export default defineConfig({
  testDir: 'tests/e2e',
  outputDir: 'test-results',
  fullyParallel: false,
  workers: 1,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  timeout: 30_000,
  use: {
    baseURL: E2E_ORIGIN,
    locale: 'de-DE',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'desktop',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } },
      grepInvert: /@mobile/,
    },
    {
      name: 'mobile',
      use: { ...devices['Pixel 7'], viewport: { width: 390, height: 844 } },
      grep: /@mobile/,
    },
  ],
  webServer: {
    command: [
      'pnpm exec cross-env NODE_ENV=test tsx tests/e2e/reset-db.ts',
      'pnpm exec cross-env NODE_ENV=test tsx seed/seed.ts',
      'pnpm build',
      `pnpm exec next start -p ${E2E_PORT}`,
    ].join(' && '),
    url: `${E2E_ORIGIN}/`,
    env: serverEnv,
    reuseExistingServer: false, // always reset, seed and build: a reused server may be stale or point elsewhere
    timeout: 600_000,
    stdout: 'pipe',
    stderr: 'pipe',
  },
})
