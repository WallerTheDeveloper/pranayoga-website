/**
 * The seed resets courses, prices, reviews and settings to the design copy and publishes them,
 * so it must never reach a live database by accident. It runs against a database on this
 * machine (the docker-compose one) unless `SEED_ALLOW_REMOTE_DB=true` says otherwise.
 */

const LOCAL_HOSTS: ReadonlySet<string> = new Set(['localhost', '127.0.0.1', '[::1]', '::1'])

export class SeedTargetError extends Error {
  override name = 'SeedTargetError'
}

export interface SeedTarget {
  nodeEnv: string | undefined
  databaseUri: string | undefined
  allowRemoteDb: string | undefined
}

export function databaseHost(uri: string | undefined): string | null {
  if (!uri) return null
  try {
    return new URL(uri).hostname || null
  } catch {
    return null
  }
}

export function assertSeedTarget({ nodeEnv, databaseUri, allowRemoteDb }: SeedTarget): void {
  if (nodeEnv === 'production') {
    throw new SeedTargetError(
      'Refusing to seed with NODE_ENV=production: it overwrites edited content.',
    )
  }
  const host = databaseHost(databaseUri)
  if (host === null) {
    throw new SeedTargetError('DATABASE_URI is missing or not a valid URL.')
  }
  if (!LOCAL_HOSTS.has(host) && allowRemoteDb !== 'true') {
    throw new SeedTargetError(
      `Refusing to seed the database on "${host}": the seed overwrites edited content. ` +
        'Set SEED_ALLOW_REMOTE_DB=true if this database really is a scratch copy.',
    )
  }
}
