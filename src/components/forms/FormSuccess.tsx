'use client'

import { useEffect, useRef, type ReactNode } from 'react'

import { CheckIcon } from '@/components/icons/UiIcons'

import styles from './Forms.module.css'

interface FormSuccessProps {
  heading: string
  text: string
  /** Under the text, e.g. the WhatsApp button. */
  children?: ReactNode
}

/** Replaces the form once it is sent. Takes focus, so the thank-you is read out at once. */
export function FormSuccess({ heading, text, children }: FormSuccessProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const element = ref.current
    if (!element) return
    element.scrollIntoView({ block: 'nearest' })
    element.focus({ preventScroll: true })
  }, [])

  return (
    <div ref={ref} className={styles.success} role="status" tabIndex={-1}>
      <span className={styles.successIcon} aria-hidden="true">
        <CheckIcon size={28} />
      </span>
      <h2 className={styles.successTitle}>{heading}</h2>
      <p className={styles.successText}>{text}</p>
      {children}
    </div>
  )
}
