import { afterEach, describe, expect, it, vi } from 'vitest'
import { z } from 'zod'

import {
  CONTACT_FIELDS,
  EMPTY_CONTACT,
  MESSAGE_MAX_LENGTH,
  validateContact,
} from '@/lib/forms/contact'
import {
  emailField,
  fieldErrors,
  localIsoDate,
  optionalText,
  parseIsoDate,
  phoneField,
  requiredText,
} from '@/lib/forms/fields'
import { EMPTY_SIGNUP, SIGNUP_FIELDS, validateSignup, type SignupValues } from '@/lib/forms/signup'
import { STUB_SEND_MS, stubSubmit } from '@/lib/forms/submit'

const TODAY = '2026-11-12'
const RULES = { planIds: ['block-1', 'block-2'], today: TODAY }

const VALID_SIGNUP: SignupValues = {
  name: 'Erika Mustermann',
  birthDate: '1990-04-12',
  street: 'Musterweg 1',
  postalCode: '45356',
  city: 'Essen',
  phone: '0175 1234567',
  email: 'erika@example.test',
  plan: 'block-1',
  startDate: TODAY,
  payment: 'direct-debit',
  accountHolder: 'Erika Mustermann',
  bankName: 'Musterbank',
  iban: 'DE89 3704 0044 0532 0130 00',
  consent: true,
}

function message(schema: z.ZodType, value: unknown): string | undefined {
  const result = schema.safeParse(value)
  return result.success ? undefined : result.error.issues[0]?.message
}

describe('field schemas', () => {
  it('requiredText trims, requires a value and caps the length', () => {
    const schema = requiredText('Fehlt', 5)
    expect(message(schema, '  ')).toBe('Fehlt')
    expect(message(schema, ' abc ')).toBeUndefined()
    expect(message(schema, 'abcdef')).toMatch(/5 Zeichen/)
  })

  it('optionalText allows empty values and caps the length', () => {
    expect(message(optionalText(3), '')).toBeUndefined()
    expect(message(optionalText(3), 'abcd')).toMatch(/3 Zeichen/)
  })

  it('emailField tells a missing address from a malformed or over-long one', () => {
    expect(message(emailField(), ' ')).toBe('Bitte geben Sie Ihre E-Mail-Adresse ein.')
    expect(message(emailField(), 'erika@')).toMatch(/gültige E-Mail-Adresse/)
    expect(message(emailField(), `${'a'.repeat(250)}@x.de`)).toMatch(/254 Zeichen/)
    expect(message(emailField(), ' erika@example.test ')).toBeUndefined()
  })

  it('phoneField is optional unless a message for a missing number is given', () => {
    expect(message(phoneField(), '')).toBeUndefined()
    expect(message(phoneField('Pflicht'), '')).toBe('Pflicht')
    expect(message(phoneField(), '12')).toBeDefined()
    expect(message(phoneField('Pflicht'), '+49 175 5830372')).toBeUndefined()
  })

  it('fieldErrors keeps the first message per field, in field order', () => {
    const issues = [
      { code: 'custom', path: ['b'], message: 'b1', input: '' },
      { code: 'custom', path: ['a'], message: 'a1', input: '' },
      { code: 'custom', path: ['b'], message: 'b2', input: '' },
    ] as z.core.$ZodIssue[]
    const errors = fieldErrors(issues, ['a', 'b', 'c'] as const)
    expect(errors).toEqual({ a: 'a1', b: 'b1' })
    expect(Object.keys(errors)).toEqual(['a', 'b'])
  })

  it('parseIsoDate accepts real calendar days only', () => {
    expect(parseIsoDate('2026-11-12')?.toISOString()).toBe('2026-11-12T00:00:00.000Z')
    expect(parseIsoDate('2027-02-29')).toBeNull()
    expect(parseIsoDate('2028-02-29')).not.toBeNull()
    expect(parseIsoDate('12.11.2026')).toBeNull()
    expect(parseIsoDate('')).toBeNull()
  })

  it('localIsoDate writes the local calendar day like a date input', () => {
    expect(localIsoDate(new Date(2026, 0, 5, 23, 59))).toBe('2026-01-05')
    expect(localIsoDate()).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })
})

describe('validateSignup', () => {
  it('accepts a complete signup', () => {
    expect(validateSignup(VALID_SIGNUP, RULES)).toEqual({})
  })

  it('lists every missing field at once, bank details included, in page order', () => {
    const errors = validateSignup(EMPTY_SIGNUP, RULES)
    expect(Object.keys(errors)).toEqual(SIGNUP_FIELDS.filter((field) => field !== 'payment'))
    expect(errors.iban).toBe('Bitte geben Sie Ihre IBAN ein.')
    expect(errors.consent).toBe('Bitte stimmen Sie der Verarbeitung Ihrer Daten zu.')
  })

  it('drops the bank fields when paying by transfer', () => {
    const errors = validateSignup(
      { ...VALID_SIGNUP, payment: 'transfer', accountHolder: '', bankName: '', iban: '' },
      RULES,
    )
    expect(errors).toEqual({})
  })

  it('tells an incomplete IBAN from a wrong checksum', () => {
    expect(validateSignup({ ...VALID_SIGNUP, iban: 'DE89 3704' }, RULES).iban).toMatch(
      /vollständige IBAN/,
    )
    expect(
      validateSignup({ ...VALID_SIGNUP, iban: 'DE88 3704 0044 0532 0130 00' }, RULES).iban,
    ).toMatch(/nicht gültig/)
  })

  it('checks dates against today', () => {
    const errors = validateSignup(
      { ...VALID_SIGNUP, birthDate: '2026-11-13', startDate: '2026-11-11' },
      RULES,
    )
    expect(errors.birthDate).toBe('Bitte geben Sie ein gültiges Geburtsdatum ein.')
    expect(errors.startDate).toBe('Der Beginn darf nicht in der Vergangenheit liegen.')
    expect(validateSignup({ ...VALID_SIGNUP, birthDate: '1899-12-31' }, RULES).birthDate).toBe(
      'Bitte geben Sie ein gültiges Geburtsdatum ein.',
    )
    expect(validateSignup({ ...VALID_SIGNUP, startDate: '2027-02-30' }, RULES).startDate).toBe(
      'Bitte wählen Sie ein gültiges Datum.',
    )
  })

  it('checks the postal code and that the plan is one on offer', () => {
    const errors = validateSignup({ ...VALID_SIGNUP, postalCode: '4535', plan: 'gone' }, RULES)
    expect(errors.postalCode).toMatch(/fünf Ziffern/)
    expect(errors.plan).toBe('Bitte wählen Sie ein Yoga-Abonnement.')
  })

  it('reports over-long bank fields in German', () => {
    const errors = validateSignup({ ...VALID_SIGNUP, bankName: 'x'.repeat(121) }, RULES)
    expect(errors.bankName).toMatch(/120 Zeichen/)
  })
})

describe('validateContact', () => {
  it('requires name, email and message', () => {
    expect(Object.keys(validateContact(EMPTY_CONTACT))).toEqual(['name', 'email', 'message'])
  })

  it('accepts a message without phone and subject', () => {
    expect(
      validateContact({
        ...EMPTY_CONTACT,
        name: 'Erika',
        email: 'erika@example.test',
        message: 'Hallo',
      }),
    ).toEqual({})
  })

  it('checks the optional phone and the message length', () => {
    const errors = validateContact({
      name: 'Erika',
      email: 'erika@example.test',
      phone: 'abc',
      subject: '',
      message: 'x'.repeat(MESSAGE_MAX_LENGTH + 1),
    })
    expect(Object.keys(errors)).toEqual(['phone', 'message'])
    expect(CONTACT_FIELDS).toContain('subject')
  })
})

describe('stubSubmit', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('resolves successfully after a short pause', async () => {
    vi.useFakeTimers()
    let settled = false
    const pending = stubSubmit({ any: 'value' }).then((result) => {
      settled = true
      return result
    })
    await vi.advanceTimersByTimeAsync(STUB_SEND_MS - 1)
    expect(settled).toBe(false)
    await vi.advanceTimersByTimeAsync(1)
    await expect(pending).resolves.toEqual({ ok: true })
  })
})
