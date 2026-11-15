import { describe, expect, it } from 'vitest'

import {
  EnvValidationError,
  parseServerEnv,
  shouldMigrateOnStart,
  shouldPushSchema,
} from '@/lib/env'

const valid = {
  DATABASE_URI: 'postgres://user:pass@127.0.0.1:5433/db',
  PAYLOAD_SECRET: 'a'.repeat(32),
  NEXT_PUBLIC_SERVER_URL: 'https://pranayogastudio.de/',
  PREVIEW_SECRET: 'b'.repeat(24),
}

describe('parseServerEnv', () => {
  it('accepts a complete env and strips the trailing slash from the origin', () => {
    const env = parseServerEnv(valid)
    expect(env.NEXT_PUBLIC_SERVER_URL).toBe('https://pranayogastudio.de')
    expect(env.DATABASE_URI).toBe(valid.DATABASE_URI)
  })

  it('lists every missing or invalid variable without echoing values', () => {
    try {
      parseServerEnv({ ...valid, PAYLOAD_SECRET: 'short', DATABASE_URI: 'mysql://x' })
      expect.unreachable()
    } catch (error) {
      expect(error).toBeInstanceOf(EnvValidationError)
      const message = (error as Error).message
      expect(message).toMatch(/PAYLOAD_SECRET/)
      expect(message).toMatch(/DATABASE_URI/)
      expect(message).not.toMatch(/short/)
      expect(message).not.toMatch(/mysql/)
    }
  })

  it('rejects a missing preview secret and a non-http origin', () => {
    expect(() => parseServerEnv({ ...valid, PREVIEW_SECRET: undefined })).toThrow(
      EnvValidationError,
    )
    expect(() => parseServerEnv({ ...valid, NEXT_PUBLIC_SERVER_URL: 'ftp://x.de' })).toThrow(
      EnvValidationError,
    )
  })
})

describe('CACHE_REFRESH_SECRET', () => {
  it('is optional: without it the refresh route stays closed', () => {
    expect(parseServerEnv(valid).CACHE_REFRESH_SECRET).toBeUndefined()
  })

  it('must be at least 24 characters when set', () => {
    expect(parseServerEnv({ ...valid, CACHE_REFRESH_SECRET: 'c'.repeat(24) })).toMatchObject({
      CACHE_REFRESH_SECRET: 'c'.repeat(24),
    })
    expect(() => parseServerEnv({ ...valid, CACHE_REFRESH_SECRET: 'short' })).toThrow(
      /CACHE_REFRESH_SECRET/,
    )
  })
})

describe('shouldMigrateOnStart', () => {
  it('is on only for an explicit "true" (the production image)', () => {
    expect(shouldMigrateOnStart({ PAYLOAD_MIGRATE_ON_START: 'true' })).toBe(true)
    expect(shouldMigrateOnStart({ PAYLOAD_MIGRATE_ON_START: ' true ' })).toBe(true)
  })

  it('stays off by default and for anything else', () => {
    expect(shouldMigrateOnStart({})).toBe(false)
    for (const value of ['', 'false', '1', 'TRUE', 'yes']) {
      expect(shouldMigrateOnStart({ PAYLOAD_MIGRATE_ON_START: value })).toBe(false)
    }
  })
})

describe('shouldPushSchema', () => {
  it("keeps Payload's dev push on unless PAYLOAD_DB_PUSH is exactly false", () => {
    expect(shouldPushSchema({})).toBe(true)
    expect(shouldPushSchema({ PAYLOAD_DB_PUSH: 'true' })).toBe(true)
    expect(shouldPushSchema({ PAYLOAD_DB_PUSH: 'false' })).toBe(false)
    expect(shouldPushSchema({ PAYLOAD_DB_PUSH: ' false ' })).toBe(false)
  })
})
