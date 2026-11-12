import type { ReactNode } from 'react'

interface AdminValueProps<T> {
  /** A value from the admin. `null`, `undefined`, '' and empty arrays render nothing. */
  value: T | null | undefined
  children: (value: T) => ReactNode
}

export function isFilled<T>(value: T | null | undefined): value is T {
  if (value === null || value === undefined) return false
  if (typeof value === 'string') return value.trim().length > 0
  if (Array.isArray(value)) return value.length > 0
  return true
}

/**
 * Renders its children only when the admin has filled the value in, so an empty field hides its
 * whole line instead of leaving a label with nothing after it.
 */
export function AdminValue<T>({ value, children }: AdminValueProps<T>) {
  return isFilled(value) ? <>{children(value)}</> : null
}
