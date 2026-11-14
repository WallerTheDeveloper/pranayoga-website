import { z } from 'zod'

import { contactCopy } from '@/content/copy/contact'

import {
  emailField,
  fieldErrors,
  optionalText,
  phoneField,
  requiredText,
  type FieldErrors,
} from './fields'

export interface ContactValues {
  name: string
  email: string
  phone: string
  subject: string
  message: string
}

export type ContactField = keyof ContactValues

export const CONTACT_FIELDS = [
  'name',
  'email',
  'phone',
  'subject',
  'message',
] as const satisfies readonly ContactField[]

export const EMPTY_CONTACT: ContactValues = {
  name: '',
  email: '',
  phone: '',
  subject: '',
  message: '',
}

export const MESSAGE_MAX_LENGTH = 2000

const errors = contactCopy.form.errors

const contactSchema = z.object({
  name: requiredText(errors.name, 120),
  email: emailField(),
  phone: phoneField(),
  subject: optionalText(150),
  message: requiredText(errors.message, MESSAGE_MAX_LENGTH),
})

/** Every problem with a message, one per field, in page order. Empty when it is valid. */
export function validateContact(values: ContactValues): FieldErrors<ContactField> {
  const result = contactSchema.safeParse(values)
  return result.success ? {} : fieldErrors(result.error.issues, CONTACT_FIELDS)
}
