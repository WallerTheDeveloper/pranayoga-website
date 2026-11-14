/** E.164: a plus, a non-zero country digit, 8–15 digits total, no spaces. Used for tel: links. */
const E164 = /^\+[1-9]\d{7,14}$/

export function isValidPhoneE164(value: string): boolean {
  return E164.test(value)
}

/** Characters people type in phone numbers: digits, spaces, "+", "/", "-", "(" and ")". */
const TYPED_PHONE = /^\+?[\d\s/()-]+$/

/**
 * A phone number as a visitor types it ("0201 123456", "+49 175 5830372", "(0201) 12 34 56"):
 * only the usual characters, a "+" only at the start, and 6–15 digits.
 */
export function isPlausiblePhone(value: string): boolean {
  const trimmed = value.trim()
  if (!TYPED_PHONE.test(trimmed)) return false
  const digits = trimmed.replace(/\D/g, '').length
  return digits >= 6 && digits <= 15
}
