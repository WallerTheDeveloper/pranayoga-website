import path from 'node:path'

/**
 * Suites that wipe data call this first: the database name must end in `_test`, so a missing or
 * wrong .env.test can never point them at the dev database.
 */
export function assertTestDatabase(uri: string | undefined = process.env.DATABASE_URI): void {
  const name = /\/([^/?]+)(\?|$)/.exec(uri ?? '')?.[1] ?? ''
  if (!name.endsWith('_test')) {
    throw new Error(
      `Expected DATABASE_URI to point at a *_test database (got "${name}"). See .env.test.example.`,
    )
  }
}

/** Only a `test-*` folder directly inside <project>/uploads/ may be emptied by the suites. */
export function isTestUploadFolder(
  staticDir: string | undefined,
  projectDir: string = process.cwd(),
): staticDir is string {
  if (!staticDir) return false
  const resolved = path.resolve(projectDir, staticDir)
  return (
    path.dirname(resolved) === path.resolve(projectDir, 'uploads') &&
    path.basename(resolved).startsWith('test-')
  )
}
