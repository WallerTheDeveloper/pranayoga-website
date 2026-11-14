'use client'

import { useEffect, useRef, type MouseEvent } from 'react'

import { AlertIcon } from '@/components/icons/UiIcons'
import { formsCopy } from '@/content/copy/forms'

import styles from './Forms.module.css'

export interface SummaryItem {
  /** The control to focus: an input, select, textarea or checkbox id. */
  fieldId: string
  label: string
  message: string
}

interface ErrorSummaryProps {
  items: readonly SummaryItem[]
  /** Changes on every submit, so a repeated failed submit moves focus here again. */
  attempt: number
}

/** Moves focus to the control and scrolls its label into view under the sticky header. */
function focusField(event: MouseEvent<HTMLAnchorElement>, fieldId: string) {
  const control = document.getElementById(fieldId)
  if (!control) return
  event.preventDefault()
  const field = control.closest('[data-field]') ?? control
  field.scrollIntoView({ block: 'start' })
  control.focus({ preventScroll: true })
}

/**
 * After a failed submit: "Bitte prüfen Sie 2 Felder." with a link per problem. It takes focus,
 * so screen readers read it at once and keyboard users start from it.
 */
export function ErrorSummary({ items, attempt }: ErrorSummaryProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (items.length > 0) ref.current?.focus()
    // Focus follows each submit, not each edit of the list.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attempt])

  if (items.length === 0) return null
  return (
    <div ref={ref} className={styles.summary} role="alert" tabIndex={-1}>
      <AlertIcon size={24} className={styles.summaryIcon} />
      <div className={styles.summaryBody}>
        <p className={styles.summaryTitle}>{formsCopy.errorSummary(items.length)}</p>
        <ul className={styles.summaryList}>
          {items.map((item) => (
            <li key={item.fieldId}>
              <a href={`#${item.fieldId}`} onClick={(event) => focusField(event, item.fieldId)}>
                {item.label}: {item.message}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
