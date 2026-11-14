'use client'

import { useHydrated } from '@/components/hooks/useHydrated'
import { ArrowIcon } from '@/components/icons/UiIcons'
import { buttonClassName } from '@/components/ui/Button'
import { formsCopy } from '@/content/copy/forms'

import styles from './SubmitButton.module.css'

interface SubmitButtonProps {
  label: string
  sending: boolean
}

/**
 * Ink pill. Disabled until the page has hydrated, because the form only works with JavaScript
 * (the <noscript> note says so). While sending it stays focusable but cannot be pressed twice.
 */
export function SubmitButton({ label, sending }: SubmitButtonProps) {
  const hydrated = useHydrated()
  return (
    <>
      <button
        className={buttonClassName('dark', styles.root)}
        type="submit"
        disabled={!hydrated}
        aria-disabled={sending || undefined}
      >
        {sending ? (
          <>
            <svg
              className={`spin ${styles.spinner}`}
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              aria-hidden="true"
              focusable="false"
            >
              <path d="M12 3a9 9 0 1 0 9 9" />
            </svg>
            <span>{formsCopy.sending}</span>
          </>
        ) : (
          <>
            <span>{label}</span>
            <ArrowIcon size={20} strokeWidth={2} />
          </>
        )}
      </button>
      <noscript>
        <p className={styles.noscript}>{formsCopy.noScript}</p>
      </noscript>
    </>
  )
}
