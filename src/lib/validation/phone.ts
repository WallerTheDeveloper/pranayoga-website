/** E.164: a plus, a non-zero country digit, 8–15 digits total, no spaces. Used for tel: links. */
const E164 = /^\+[1-9]\d{7,14}$/

export function isValidPhoneE164(value: string): boolean {
  return E164.test(value)
}
