import type { Access, FieldAccess, PayloadRequest, Where } from 'payload'

/**
 * Access helpers. One role for now: every logged-in admin user can do everything; anonymous
 * visitors read published content only. Collections and globals use these instead of inline
 * logic, so an `editor` role later only changes this file (docs/PLAN.md "Access & permissions").
 */

export function hasUser(req: Pick<PayloadRequest, 'user'>): boolean {
  return Boolean(req.user)
}

export const isLoggedIn: Access = ({ req }) => hasUser(req)

export const publishedOnly: Where = { _status: { equals: 'published' } }

/** Logged-in users see drafts; everyone else gets published documents only. */
export const publishedOrLoggedIn: Access = ({ req }) => (hasUser(req) ? true : publishedOnly)

export const anyone: Access = () => true

export const nobody: Access = () => false

/** Field-level lock, e.g. course slugs after creation. */
export const nobodyField: FieldAccess = () => false
