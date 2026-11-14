'use client'

import Link from 'next/link'

import { AlertIcon } from '@/components/icons/UiIcons'
import { WhatsAppButton } from '@/components/ui/WhatsAppButton'
import { contactCopy } from '@/content/copy/contact'
import { formsCopy } from '@/content/copy/forms'
import { sharedCopy } from '@/content/copy/shared'
import {
  CONTACT_FIELDS,
  EMPTY_CONTACT,
  validateContact,
  type ContactField,
} from '@/lib/forms/contact'
import { stubSubmit, type FormSubmitter } from '@/lib/forms/submit'
import { routes } from '@/lib/routes'

import { ErrorSummary, type SummaryItem } from './ErrorSummary'
import { TextareaField, TextField } from './Fields'
import styles from './Forms.module.css'
import { FormSuccess } from './FormSuccess'
import { SubmitButton } from './SubmitButton'
import { useFormFlow } from './useFormFlow'

interface ContactFormProps {
  groupUrl: string | null
  className?: string
  submit?: FormSubmitter<typeof EMPTY_CONTACT>
}

const copy = contactCopy.form

export function contactFieldId(field: ContactField): string {
  return `contact-${field}`
}

const LABELS: Readonly<Record<ContactField, string>> = {
  name: copy.name,
  email: copy.email,
  phone: copy.phone,
  subject: copy.subject,
  message: copy.message,
}

/** "Schreiben Sie uns jetzt eine Nachricht!" UI only until launch (docs/PLAN.md). */
export function ContactForm({ groupUrl, className, submit = stubSubmit }: ContactFormProps) {
  const { values, errors, status, attempt, setField, handleSubmit } = useFormFlow({
    initial: EMPTY_CONTACT,
    validate: validateContact,
    submit,
  })

  if (status === 'sent') {
    return (
      <div className={className}>
        <FormSuccess heading={copy.success.heading} text={copy.success.text}>
          {groupUrl ? (
            <WhatsAppButton
              href={groupUrl}
              label={sharedCopy.whatsApp.bookLabel}
              ariaLabel={sharedCopy.whatsApp.bookAriaLabel}
              size="small"
            />
          ) : null}
        </FormSuccess>
      </div>
    )
  }

  const summary: SummaryItem[] = CONTACT_FIELDS.flatMap((field) => {
    const message = errors[field]
    return message ? [{ fieldId: contactFieldId(field), label: LABELS[field], message }] : []
  })
  const sending = status === 'sending'
  const field = (name: ContactField) => ({
    id: contactFieldId(name),
    name,
    label: LABELS[name],
    value: values[name],
    onChange: (value: string) => setField(name, value),
    error: errors[name],
    readOnly: sending,
  })

  return (
    <form
      className={[styles.form, styles.contactForm, className ?? ''].filter(Boolean).join(' ')}
      onSubmit={handleSubmit}
      noValidate
      aria-labelledby="contact-form-title"
    >
      <h2 id="contact-form-title" className={styles.formTitle}>
        {copy.title}
      </h2>
      <ErrorSummary items={summary} attempt={attempt} />
      <div className={styles.grid}>
        <TextField {...field('name')} autoComplete="name" />
        <TextField {...field('email')} type="email" autoComplete="email" spellCheck={false} />
        <TextField {...field('phone')} type="tel" autoComplete="tel" optional />
        <TextField {...field('subject')} optional />
        <TextareaField {...field('message')} wide />
      </div>
      <p className={styles.hint}>
        {copy.privacyBefore} <Link href={routes.privacyPolicy()}>{copy.privacyLink}</Link>
        {copy.privacyAfter}
      </p>
      {status === 'failed' ? (
        <p className={styles.failed} role="alert">
          <AlertIcon size={20} />
          <span>{formsCopy.submitFailed}</span>
        </p>
      ) : null}
      <SubmitButton label={copy.submit} sending={sending} />
    </form>
  )
}
