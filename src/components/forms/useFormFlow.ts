'use client'

import { useCallback, useState, type FormEvent } from 'react'

import type { FieldErrors } from '@/lib/forms/fields'
import type { FormSubmitter } from '@/lib/forms/submit'

export type FormStatus = 'editing' | 'sending' | 'sent' | 'failed'

interface FormFlowOptions<V, K extends string> {
  initial: V
  validate: (values: V) => FieldErrors<K>
  submit: FormSubmitter<V>
}

export interface FormFlow<V, K extends string> {
  values: V
  errors: FieldErrors<K>
  status: FormStatus
  /** Counts submits; the error summary takes focus again on each one. */
  attempt: number
  setField: <F extends keyof V>(field: F, value: V[F]) => void
  handleSubmit: (event: FormEvent<HTMLFormElement>) => void
}

/**
 * Edit → validate on submit → send → thank you. Errors appear only after a submit and stay until
 * the next one (Komponenten.dc.html: "Validation runs on submit, not while typing").
 */
export function useFormFlow<V, K extends string>({
  initial,
  validate,
  submit,
}: FormFlowOptions<V, K>): FormFlow<V, K> {
  const [values, setValues] = useState<V>(initial)
  const [errors, setErrors] = useState<FieldErrors<K>>({})
  const [status, setStatus] = useState<FormStatus>('editing')
  const [attempt, setAttempt] = useState(0)

  const setField = useCallback(
    <F extends keyof V>(field: F, value: V[F]) => {
      if (status === 'sending') return
      setValues((previous) => ({ ...previous, [field]: value }))
    },
    [status],
  )

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (status === 'sending') return
    const found = validate(values)
    setErrors(found)
    setAttempt((count) => count + 1)
    if (Object.keys(found).length > 0) {
      setStatus('editing')
      return
    }
    setStatus('sending')
    submit(values)
      .then((result) => setStatus(result.ok ? 'sent' : 'failed'))
      .catch(() => setStatus('failed'))
  }

  return { values, errors, status, attempt, setField, handleSubmit }
}
