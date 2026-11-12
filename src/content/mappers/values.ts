import { hasOpenPlaceholder } from '@/lib/placeholders'

/**
 * Defensive readers for admin values. Drafts in Live Preview skip validation, so even "required"
 * fields may be missing; nothing here throws.
 */

/** Trimmed text, or null when empty or still holding a `[…]` placeholder. */
export function cleanText(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const text = value.trim()
  if (text.length === 0 || hasOpenPlaceholder(text)) return null
  return text
}

/** Trimmed text, or null when empty. Placeholders are kept (filled later by the caller). */
export function rawText(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const text = value.trim()
  return text.length > 0 ? text : null
}

export function asBoolean(value: unknown): boolean {
  return value === true
}

export function asArray<T>(value: readonly T[] | null | undefined): readonly T[] {
  return Array.isArray(value) ? value : []
}

/** Payload row ids are strings; fall back to the index for rows saved without one. */
export function rowId(value: unknown, index: number): string {
  if (typeof value === 'string' && value.length > 0) return value
  if (typeof value === 'number') return String(value)
  return `row-${index}`
}

export function isPresent<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined
}
