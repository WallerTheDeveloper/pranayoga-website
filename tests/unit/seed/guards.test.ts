import path from 'node:path'

import { describe, expect, it } from 'vitest'

import { assertSeedTarget, databaseHost, SeedTargetError } from '../../../seed/guard'
import { assertTestDatabase, isTestUploadFolder } from '../../setup/testDatabase'

const LOCAL = 'postgres://postgres:postgres@localhost:5432/pranayoga'
const REMOTE = 'postgres://app:secret@db.example.com:5432/pranayoga'

describe('assertSeedTarget', () => {
  it('allows a local database outside production', () => {
    for (const uri of [
      LOCAL,
      LOCAL.replace('localhost', '127.0.0.1'),
      LOCAL.replace('localhost', '[::1]'),
    ]) {
      expect(() =>
        assertSeedTarget({ nodeEnv: 'development', databaseUri: uri, allowRemoteDb: undefined }),
      ).not.toThrow()
    }
    expect(() =>
      assertSeedTarget({ nodeEnv: 'test', databaseUri: LOCAL, allowRemoteDb: undefined }),
    ).not.toThrow()
  })

  it('refuses production, even with a local database', () => {
    expect(() =>
      assertSeedTarget({ nodeEnv: 'production', databaseUri: LOCAL, allowRemoteDb: 'true' }),
    ).toThrow(/NODE_ENV=production/)
  })

  it('refuses a remote database unless explicitly allowed', () => {
    expect(() =>
      assertSeedTarget({ nodeEnv: undefined, databaseUri: REMOTE, allowRemoteDb: undefined }),
    ).toThrow(SeedTargetError)
    expect(() =>
      assertSeedTarget({ nodeEnv: undefined, databaseUri: REMOTE, allowRemoteDb: '1' }),
    ).toThrow(/db\.example\.com/)
    expect(() =>
      assertSeedTarget({ nodeEnv: undefined, databaseUri: REMOTE, allowRemoteDb: 'true' }),
    ).not.toThrow()
  })

  it('refuses a missing or broken DATABASE_URI', () => {
    expect(() =>
      assertSeedTarget({ nodeEnv: undefined, databaseUri: undefined, allowRemoteDb: 'true' }),
    ).toThrow(/DATABASE_URI/)
    expect(() =>
      assertSeedTarget({ nodeEnv: undefined, databaseUri: 'not a url', allowRemoteDb: 'true' }),
    ).toThrow(/DATABASE_URI/)
  })

  it('reads the host from a connection string', () => {
    expect(databaseHost(REMOTE)).toBe('db.example.com')
    expect(databaseHost('')).toBeNull()
  })
})

describe('test suite guards', () => {
  const project = path.resolve('/work/site')

  it('accepts only a test-* folder directly inside uploads/', () => {
    expect(isTestUploadFolder(path.join(project, 'uploads', 'test-media'), project)).toBe(true)
    expect(isTestUploadFolder('uploads/test-media', project)).toBe(true)
    for (const unsafe of [
      'tests',
      'latest',
      'uploads/media',
      'uploads/latest',
      'uploads/test-media/..',
      'uploads/a/test-media',
      '',
    ]) {
      expect(isTestUploadFolder(unsafe, project), unsafe).toBe(false)
    }
    expect(isTestUploadFolder(undefined, project)).toBe(false)
  })

  it('requires a *_test database', () => {
    expect(() => assertTestDatabase('postgres://u:p@localhost:5432/pranayoga_test')).not.toThrow()
    expect(() => assertTestDatabase('postgres://u:p@localhost:5432/pranayoga')).toThrow(/_test/)
    expect(() => assertTestDatabase(undefined)).toThrow()
  })
})
