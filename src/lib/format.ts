/** German formatting for prices, times and contact links. */

const wholeEuro = new Intl.NumberFormat('de-DE', {
  style: 'currency',
  currency: 'EUR',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
})

const euroWithCents = new Intl.NumberFormat('de-DE', {
  style: 'currency',
  currency: 'EUR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

/** "15 €", "79,90 €". Null when the admin has not entered a valid price yet. */
export function formatPrice(amount: number | null | undefined): string | null {
  if (typeof amount !== 'number' || !Number.isFinite(amount) || amount < 0) return null
  return Number.isInteger(amount) ? wholeEuro.format(amount) : euroWithCents.format(amount)
}

/** The studio's time zone: admin dates are read as they look on its calendar. */
const STUDIO_TIME_ZONE = 'Europe/Berlin'

const monthYear = new Intl.DateTimeFormat('de-DE', {
  month: 'long',
  year: 'numeric',
  timeZone: STUDIO_TIME_ZONE,
})

/**
 * "März 2027" from an admin date. The month picker stores local midnight on the 1st, which is
 * the evening before in UTC, so the month is read in the studio's time zone. Null when unset.
 */
export function formatMonthYear(value: string | null | undefined): string | null {
  if (!value) return null
  const time = Date.parse(value)
  return Number.isFinite(time) ? monthYear.format(time) : null
}

const dayParts = new Intl.DateTimeFormat('de-DE', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: STUDIO_TIME_ZONE,
})

interface CalendarDay {
  day: string
  month: string
  year: string
}

/** Day, month name and year of an admin date on the studio's calendar; null when unparsable. */
function calendarDay(value: string | null | undefined): CalendarDay | null {
  if (!value) return null
  const time = Date.parse(value)
  if (!Number.isFinite(time)) return null
  const parts = dayParts.formatToParts(time)
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((entry) => entry.type === type)?.value ?? ''
  return { day: part('day'), month: part('month'), year: part('year') }
}

/** "12. November 2026" from an admin date, read on the studio's calendar. Null when unset. */
export function formatDate(value: string | null | undefined): string | null {
  const date = calendarDay(value)
  return date ? `${date.day}. ${date.month} ${date.year}` : null
}

/**
 * A weekend or any span of days, as short as German allows: "14.–15. März 2027",
 * "31. Mai – 1. Juni 2027", "31. Dezember 2027 – 1. Januar 2028". A missing or earlier end
 * collapses to the single first day. Null without a valid first day.
 */
export function formatDateRange(
  from: string | null | undefined,
  to: string | null | undefined,
): string | null {
  const start = calendarDay(from)
  if (!start) return null
  const end = calendarDay(to)
  const single = `${start.day}. ${start.month} ${start.year}`
  if (!end || Date.parse(to ?? '') <= Date.parse(from ?? '')) return single
  if (end.year !== start.year) return `${single} – ${end.day}. ${end.month} ${end.year}`
  if (end.month !== start.month) {
    return `${start.day}. ${start.month} – ${end.day}. ${end.month} ${end.year}`
  }
  return end.day === start.day ? single : `${start.day}.–${end.day}. ${end.month} ${end.year}`
}

export const WEEKDAYS = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
] as const

export type Weekday = (typeof WEEKDAYS)[number]

export const WEEKDAY_LABELS: Readonly<Record<Weekday, string>> = {
  monday: 'Montag',
  tuesday: 'Dienstag',
  wednesday: 'Mittwoch',
  thursday: 'Donnerstag',
  friday: 'Freitag',
  saturday: 'Samstag',
  sunday: 'Sonntag',
}

/** "18:00–19:30 Uhr", or "18:00 Uhr" without an end time. */
export function formatTimeRange(start: string, end: string | null | undefined): string {
  return end ? `${start}–${end} Uhr` : `${start} Uhr`
}

export function telHref(phoneE164: string): string {
  return `tel:${phoneE164}`
}

export function mailtoHref(email: string): string {
  return `mailto:${email}`
}
