import { z } from 'zod'

import { signupCopy } from '@/content/copy/signup'
import { ibanProblem, type IbanProblem } from '@/lib/validation/iban'

import {
  emailField,
  fieldErrors,
  optionalText,
  parseIsoDate,
  phoneField,
  requiredText,
  type FieldErrors,
} from './fields'

export const PAYMENT_METHODS = ['direct-debit', 'transfer'] as const
export type PaymentMethod = (typeof PAYMENT_METHODS)[number]

export interface SignupValues {
  name: string
  birthDate: string
  street: string
  postalCode: string
  city: string
  phone: string
  email: string
  plan: string
  startDate: string
  payment: PaymentMethod
  accountHolder: string
  bankName: string
  iban: string
  consent: boolean
}

export type SignupField = keyof SignupValues

/** Page order: the error summary lists problems the way the visitor meets them. */
export const SIGNUP_FIELDS = [
  'name',
  'birthDate',
  'street',
  'postalCode',
  'city',
  'phone',
  'email',
  'plan',
  'startDate',
  'payment',
  'accountHolder',
  'bankName',
  'iban',
  'consent',
] as const satisfies readonly SignupField[]

export const EMPTY_SIGNUP: SignupValues = {
  name: '',
  birthDate: '',
  street: '',
  postalCode: '',
  city: '',
  phone: '',
  email: '',
  plan: '',
  startDate: '',
  payment: 'direct-debit',
  accountHolder: '',
  bankName: '',
  iban: '',
  consent: false,
}

const errors = signupCopy.errors
const EARLIEST_BIRTH_YEAR = 1900

export interface SignupRules {
  /** Price block ids the select offers. */
  planIds: readonly string[]
  /** "2026-11-12" on the visitor's calendar: the earliest start and the latest birth date. */
  today: string
}

function isBirthDate(value: string, today: string): boolean {
  const date = parseIsoDate(value)
  return date !== null && value <= today && date.getUTCFullYear() >= EARLIEST_BIRTH_YEAR
}

function signupSchema({ planIds, today }: SignupRules) {
  return z.object({
    name: requiredText(errors.name, 120),
    birthDate: z
      .string()
      .min(1, { error: errors.birthDate, abort: true })
      .refine((value) => isBirthDate(value, today), { error: errors.birthDateInvalid }),
    street: requiredText(errors.street, 120),
    postalCode: z
      .string()
      .trim()
      .min(1, { error: errors.postalCode, abort: true })
      .regex(/^\d{5}$/, { error: errors.postalCodeInvalid }),
    city: requiredText(errors.city, 80),
    phone: phoneField(errors.phone),
    email: emailField(),
    plan: z.string().refine((value) => planIds.includes(value), { error: errors.plan }),
    startDate: z
      .string()
      .min(1, { error: errors.startDate, abort: true })
      .refine((value) => parseIsoDate(value) !== null, {
        error: errors.startDateInvalid,
        abort: true,
      })
      .refine((value) => value >= today, { error: errors.startDatePast }),
    payment: z.enum(PAYMENT_METHODS),
    accountHolder: optionalText(120),
    bankName: optionalText(120),
    iban: z.string().trim(),
    consent: z.boolean().refine((value) => value, { error: errors.consent }),
  })
}

/**
 * The account fields count only for direct debit; with a transfer they stay hidden. Checked
 * apart from the schema, whose object-level refinements would wait until every other field is
 * valid, so a first submit already lists them with the rest.
 */
function accountErrors(values: SignupValues): FieldErrors<SignupField> {
  if (values.payment !== 'direct-debit') return {}
  const iban = ibanError(values.iban.trim())
  return {
    ...(values.accountHolder.trim() ? {} : { accountHolder: errors.accountHolder }),
    ...(values.bankName.trim() ? {} : { bankName: errors.bankName }),
    ...(iban ? { iban } : {}),
  }
}

const IBAN_ERRORS: Readonly<Record<IbanProblem, string>> = {
  format: errors.ibanFormat,
  checksum: errors.ibanChecksum,
}

function ibanError(iban: string): string | null {
  if (!iban) return errors.iban
  const problem = ibanProblem(iban)
  return problem ? IBAN_ERRORS[problem] : null
}

/** Every problem with a signup, one message per field, in page order. Empty when it is valid. */
export function validateSignup(values: SignupValues, rules: SignupRules): FieldErrors<SignupField> {
  const result = signupSchema(rules).safeParse(values)
  const found: FieldErrors<SignupField> = {
    ...(result.success ? {} : fieldErrors(result.error.issues, SIGNUP_FIELDS)),
    ...accountErrors(values),
  }
  const ordered: FieldErrors<SignupField> = {}
  for (const field of SIGNUP_FIELDS) {
    const message = found[field]
    if (message) ordered[field] = message
  }
  return ordered
}
