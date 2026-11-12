import type { PayloadRequest } from 'payload'
import { describe, expect, it } from 'vitest'

import {
  anyone,
  hasUser,
  isLoggedIn,
  nobody,
  nobodyField,
  publishedOnly,
  publishedOrLoggedIn,
} from '@/access'
import { courseTag } from '@/cache/tags'
import { countTrialBlocks, trialRuleError } from '@/collections/trialRule'

type AccessArgs = Parameters<typeof isLoggedIn>[0]

function accessArgs(user: unknown): AccessArgs {
  return { req: { user } as PayloadRequest } as AccessArgs
}

describe('access helpers', () => {
  const admin = { id: 1, email: 'a@b.de', collection: 'users' }

  it('lets logged-in users do everything', () => {
    expect(hasUser({ user: null })).toBe(false)
    expect(isLoggedIn(accessArgs(admin))).toBe(true)
    expect(isLoggedIn(accessArgs(null))).toBe(false)
  })

  it('limits anonymous reads to published documents', () => {
    expect(publishedOrLoggedIn(accessArgs(admin))).toBe(true)
    expect(publishedOrLoggedIn(accessArgs(null))).toEqual(publishedOnly)
    expect(publishedOnly).toEqual({ _status: { equals: 'published' } })
  })

  it('has fixed allow and deny helpers', () => {
    expect(anyone(accessArgs(null))).toBe(true)
    expect(nobody(accessArgs(admin))).toBe(false)
    expect(
      nobodyField({ req: { user: admin } } as unknown as Parameters<typeof nobodyField>[0]),
    ).toBe(false)
  })
})

describe('trial rule', () => {
  it('counts marked blocks', () => {
    expect(countTrialBlocks(null)).toBe(0)
    expect(countTrialBlocks([{ isTrial: true }, { isTrial: false }, {}])).toBe(1)
  })

  it('passes with no or one trial block', () => {
    expect(trialRuleError([{ isTrial: false }], [{ blocks: [{ isTrial: true }] }])).toBeNull()
    expect(trialRuleError([{ isTrial: true }], [{ blocks: [{ isTrial: false }] }])).toBeNull()
    expect(trialRuleError(undefined, [])).toBeNull()
  })

  it('refuses two trial blocks in one group', () => {
    expect(trialRuleError([{ isTrial: true }, { isTrial: true }], [])).toMatch(/mehr als ein Block/)
  })

  it('names the group that already holds the trial', () => {
    expect(
      trialRuleError([{ isTrial: true }], [{ title: 'Probestunde', blocks: [{ isTrial: true }] }]),
    ).toMatch(/„Probestunde“/)
    expect(
      trialRuleError([{ isTrial: true }], [{ title: null, blocks: [{ isTrial: true }] }]),
    ).toMatch(/einer anderen Gruppe/)
  })
})

describe('cache tags', () => {
  it('builds one tag per course', () => {
    expect(courseTag('hatha-yoga')).toBe('course:hatha-yoga')
  })
})
