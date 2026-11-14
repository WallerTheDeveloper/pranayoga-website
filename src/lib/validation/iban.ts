/** IBAN length per country for the SEPA countries we expect; others fall back to 15–34. */
const IBAN_LENGTHS: Readonly<Record<string, number>> = {
  AT: 20,
  BE: 16,
  CH: 21,
  DE: 22,
  ES: 24,
  FR: 27,
  IT: 27,
  LU: 20,
  NL: 18,
  PL: 28,
}

const IBAN_SHAPE = /^[A-Z]{2}\d{2}[A-Z0-9]{11,30}$/

export function normalizeIban(value: string): string {
  return value.replace(/[\s-]+/g, '').toUpperCase()
}

/** ISO 13616 mod-97 checksum, computed piecewise so it never needs BigInt. */
function mod97(digits: string): number {
  let remainder = 0
  for (let index = 0; index < digits.length; index += 7) {
    remainder = Number(`${remainder}${digits.slice(index, index + 7)}`) % 97
  }
  return remainder
}

export type IbanProblem = 'format' | 'checksum'

/**
 * What is wrong with an IBAN, if anything: 'format' for the wrong shape or length (a digit
 * missing), 'checksum' for a complete-looking IBAN with a typo. Null when it is valid.
 */
export function ibanProblem(value: string): IbanProblem | null {
  const iban = normalizeIban(value)
  if (!IBAN_SHAPE.test(iban)) return 'format'

  const country = iban.slice(0, 2)
  const expectedLength = IBAN_LENGTHS[country]
  if (expectedLength !== undefined && iban.length !== expectedLength) return 'format'

  const rearranged = `${iban.slice(4)}${iban.slice(0, 4)}`
  const digits = rearranged.replace(/[A-Z]/g, (letter) => String(letter.charCodeAt(0) - 55))
  return mod97(digits) === 1 ? null : 'checksum'
}

export function isValidIban(value: string): boolean {
  return ibanProblem(value) === null
}

/** Groups of four, as printed on bank documents. */
export function formatIban(value: string): string {
  return normalizeIban(value).replace(/(.{4})(?=.)/g, '$1 ')
}
