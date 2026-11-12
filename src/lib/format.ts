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
