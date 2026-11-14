import { z } from 'zod'

import { formsCopy } from '@/content/copy/forms'
import { isPlausiblePhone } from '@/lib/validation/phone'

/** One message per field, keyed by the field's name; absent when the field is fine. */
export type FieldErrors<K extends string> = Partial<Record<K, string>>

/** A required text field: trimmed, not empty, at most `max` characters. */
export function requiredText(missing: string, max = 200) {
  return z
    .string()
    .trim()
    .min(1, { error: missing, abort: true })
    .max(max, { error: formsCopy.tooLong(max) })
}

/** An optional text field: empty is fine, otherwise at most `max` characters. */
export function optionalText(max = 200) {
  return z
    .string()
    .trim()
    .max(max, { error: formsCopy.tooLong(max) })
}

export function emailField() {
  return z
    .string()
    .trim()
    .min(1, { error: formsCopy.emailMissing, abort: true })
    .max(254, { error: formsCopy.tooLong(254), abort: true })
    .pipe(z.email({ error: formsCopy.emailInvalid }))
}

/** A phone number; `missing` makes it required, without it an empty value passes. */
export function phoneField(missing?: string) {
  return z
    .string()
    .trim()
    .refine((value) => (missing ? value.length > 0 : true), { error: missing, abort: true })
    .refine((value) => value.length === 0 || isPlausiblePhone(value), {
      error: formsCopy.phoneInvalid,
    })
}

/** The first message for each field, in the order the fields appear on the page. */
export function fieldErrors<K extends string>(
  issues: readonly z.core.$ZodIssue[],
  fields: readonly K[],
): FieldErrors<K> {
  const errors: FieldErrors<K> = {}
  for (const field of fields) {
    const issue = issues.find((candidate) => candidate.path[0] === field)
    if (issue) errors[field] = issue.message
  }
  return errors
}

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/

/** "2026-11-12" for a real calendar day (no 31 February); null otherwise. */
export function parseIsoDate(value: string): Date | null {
  const match = ISO_DATE.exec(value)
  if (!match) return null
  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  const date = new Date(Date.UTC(year, month - 1, day))
  const real =
    date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day
  return real ? date : null
}

/** Today on the visitor's own calendar, as a date input writes it: "2026-11-12". */
export function localIsoDate(now: Date = new Date()): string {
  const pad = (value: number) => String(value).padStart(2, '0')
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
}
