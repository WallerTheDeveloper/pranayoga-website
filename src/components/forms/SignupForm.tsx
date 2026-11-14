'use client'

import Link from 'next/link'
import { useMemo } from 'react'

import { AlertIcon } from '@/components/icons/UiIcons'
import { WhatsAppButton } from '@/components/ui/WhatsAppButton'
import { formsCopy } from '@/content/copy/forms'
import { sharedCopy } from '@/content/copy/shared'
import { signupCopy } from '@/content/copy/signup'
import type { SignupPlanGroup } from '@/content/types'
import { localIsoDate } from '@/lib/forms/fields'
import {
  EMPTY_SIGNUP,
  SIGNUP_FIELDS,
  validateSignup,
  type PaymentMethod,
  type SignupField,
} from '@/lib/forms/signup'
import { stubSubmit, type FormSubmitter } from '@/lib/forms/submit'
import { routes } from '@/lib/routes'

import { ErrorSummary, type SummaryItem } from './ErrorSummary'
import { CheckboxField, RadioCardGroup, SelectField, TextField } from './Fields'
import styles from './Forms.module.css'
import { FormSuccess } from './FormSuccess'
import { SubmitButton } from './SubmitButton'
import { useFormFlow } from './useFormFlow'

interface SignupFormProps {
  planGroups: readonly SignupPlanGroup[]
  /** For the transfer note: "Deutsche Bank · IBAN DE11 …". Hidden when the IBAN is missing. */
  bank: { bankName: string | null; iban: string | null }
  groupUrl: string | null
  submit?: FormSubmitter<typeof EMPTY_SIGNUP>
}

const copy = signupCopy

/** Each field's control id. Payment points at its first radio card. */
export function signupFieldId(field: SignupField): string {
  return field === 'payment' ? 'signup-payment-direct-debit' : `signup-${field}`
}

const SUMMARY_LABELS: Readonly<Record<SignupField, string>> = {
  name: copy.personal.name,
  birthDate: copy.personal.birthDate,
  street: copy.personal.street,
  postalCode: copy.personal.postalCode,
  city: copy.personal.city,
  phone: copy.personal.phone,
  email: copy.personal.email,
  plan: copy.subscription.plan,
  startDate: copy.subscription.startDate,
  payment: copy.payment.question,
  accountHolder: copy.payment.accountHolder,
  bankName: copy.payment.bankName,
  iban: copy.payment.iban,
  consent: copy.consent.link,
}

/** Shown only for direct debit; with a transfer their errors leave the summary too. */
const ACCOUNT_FIELDS: ReadonlySet<SignupField> = new Set(['accountHolder', 'bankName', 'iban'])

const PAYMENT_OPTIONS: readonly { value: PaymentMethod; label: string }[] = [
  { value: 'direct-debit', label: copy.payment.directDebit },
  { value: 'transfer', label: copy.payment.transfer },
]

/** Anmeldeformular: three fieldsets, validated on submit. UI only until launch (docs/PLAN.md). */
export function SignupForm({ planGroups, bank, groupUrl, submit = stubSubmit }: SignupFormProps) {
  const planIds = useMemo(
    () => planGroups.flatMap((group) => group.plans.map((plan) => plan.id)),
    [planGroups],
  )
  const { values, errors, status, attempt, setField, handleSubmit } = useFormFlow({
    initial: EMPTY_SIGNUP,
    validate: (current) => validateSignup(current, { planIds, today: localIsoDate() }),
    submit,
  })

  if (status === 'sent') {
    return (
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
    )
  }

  // Without a plan to choose the form could never be sent: point to the other ways instead.
  if (planGroups.length === 0) {
    return (
      <div className={`${styles.panel} ${styles.unavailable}`} role="note">
        <p className={styles.unavailableText}>{copy.subscription.noPlans}</p>
        {groupUrl ? (
          <WhatsAppButton
            href={groupUrl}
            label={sharedCopy.whatsApp.bookLabel}
            ariaLabel={sharedCopy.whatsApp.bookAriaLabel}
            size="small"
          />
        ) : null}
      </div>
    )
  }

  const sending = status === 'sending'
  const directDebit = values.payment === 'direct-debit'
  const summary: SummaryItem[] = SIGNUP_FIELDS.filter(
    (field) => directDebit || !ACCOUNT_FIELDS.has(field),
  ).flatMap((field) => {
    const message = errors[field]
    return message ? [{ fieldId: signupFieldId(field), label: SUMMARY_LABELS[field], message }] : []
  })
  const text = (field: Exclude<SignupField, 'payment' | 'consent'>) => ({
    id: signupFieldId(field),
    name: field,
    value: values[field],
    onChange: (value: string) => setField(field, value),
    error: errors[field],
    readOnly: sending,
  })

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate aria-label={copy.heading}>
      <ErrorSummary items={summary} attempt={attempt} />

      <fieldset className={styles.fieldset}>
        <legend className={styles.legend}>{copy.personal.legend}</legend>
        <div className={styles.grid}>
          <TextField {...text('name')} label={copy.personal.name} autoComplete="name" />
          <TextField
            {...text('birthDate')}
            label={copy.personal.birthDate}
            type="date"
            autoComplete="bday"
          />
          <TextField
            {...text('street')}
            label={copy.personal.street}
            autoComplete="street-address"
            wide
          />
          <TextField
            {...text('postalCode')}
            label={copy.personal.postalCode}
            autoComplete="postal-code"
            inputMode="numeric"
          />
          <TextField {...text('city')} label={copy.personal.city} autoComplete="address-level2" />
          <TextField {...text('phone')} label={copy.personal.phone} type="tel" autoComplete="tel" />
          <TextField
            {...text('email')}
            label={copy.personal.email}
            type="email"
            autoComplete="email"
            spellCheck={false}
          />
        </div>
      </fieldset>

      <fieldset className={styles.fieldset}>
        <legend className={styles.legend}>{copy.subscription.legend}</legend>
        <div className={styles.grid}>
          <SelectField
            id={signupFieldId('plan')}
            name="plan"
            label={copy.subscription.plan}
            placeholder={copy.subscription.planPlaceholder}
            value={values.plan}
            onChange={(value) => setField('plan', value)}
            error={errors.plan}
            groups={planGroups.map((group) => ({
              label: group.label,
              options: group.plans.map((plan) => ({ value: plan.id, label: plan.label })),
            }))}
          />
          <TextField
            {...text('startDate')}
            label={copy.subscription.startDate}
            hint={copy.subscription.startDateHint}
            type="date"
          />
        </div>
      </fieldset>

      <fieldset className={styles.fieldset}>
        <legend className={styles.legend}>{copy.payment.legend}</legend>
        <RadioCardGroup
          name="payment"
          label={copy.payment.question}
          idPrefix="signup-payment"
          value={values.payment}
          options={PAYMENT_OPTIONS}
          onChange={(value) => setField('payment', value)}
        />
        {directDebit ? (
          <div className={`${styles.grid} ${styles.panel}`}>
            <TextField
              {...text('accountHolder')}
              label={copy.payment.accountHolder}
              autoComplete="name"
            />
            <TextField {...text('bankName')} label={copy.payment.bankName} />
            <TextField
              {...text('iban')}
              label={copy.payment.iban}
              hint={copy.payment.ibanHint}
              autoComplete="off"
              spellCheck={false}
              wide
            />
          </div>
        ) : bank.iban ? (
          <p className={`${styles.panel} ${styles.transferNote}`}>
            <strong>{copy.payment.transferTo}</strong>
            <span>
              {[bank.bankName, copy.payment.transferIban].filter(Boolean).join(' · ')}{' '}
              <span className={styles.mono}>{bank.iban}</span>
            </span>
          </p>
        ) : null}
      </fieldset>

      <div className={styles.actions}>
        <CheckboxField
          id={signupFieldId('consent')}
          name="consent"
          checked={values.consent}
          onChange={(checked) => setField('consent', checked)}
          error={errors.consent}
        >
          {copy.consent.text} <Link href={routes.privacyPolicy()}>{copy.consent.link}</Link>
        </CheckboxField>
        <p className={styles.hint}>{copy.consent.binding}</p>
        {status === 'failed' ? (
          <p className={styles.failed} role="alert">
            <AlertIcon size={20} />
            <span>{formsCopy.submitFailed}</span>
          </p>
        ) : null}
        <SubmitButton label={copy.submit} sending={sending} />
      </div>
    </form>
  )
}
