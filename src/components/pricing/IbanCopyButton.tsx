'use client'

import { useEffect, useRef, useState } from 'react'

import { useHydrated } from '@/components/hooks/useHydrated'
import { CheckIcon, CopyIcon } from '@/components/icons/UiIcons'
import { pricingCopy } from '@/content/copy/pricing'

import styles from './SignupWays.module.css'

interface IbanCopyButtonProps {
  /** The IBAN as shown, in groups of four; copied without spaces. */
  iban: string
}

type CopyState = 'idle' | 'copied' | 'failed'

/** How long "Kopiert" stays on the button before it reads "IBAN kopieren" again. */
export const COPIED_RESET_MS = 2500

/**
 * Copies the IBAN for online banking. The button label switches to "Kopiert" and a polite status
 * line says what happened, also when the browser refuses the clipboard. Rendered only once the
 * page has hydrated, so it never sits there doing nothing; the IBAN can always be selected.
 */
export function IbanCopyButton({ iban }: IbanCopyButtonProps) {
  const copy = pricingCopy.bank
  const [state, setState] = useState<CopyState>('idle')
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const hydrated = useHydrated()

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current)
    },
    [],
  )

  const handleClick = async () => {
    if (timer.current) clearTimeout(timer.current)
    try {
      await navigator.clipboard.writeText(iban.replace(/\s+/g, ''))
      setState('copied')
    } catch {
      setState('failed')
    }
    timer.current = setTimeout(() => setState('idle'), COPIED_RESET_MS)
  }

  if (!hydrated) return null

  return (
    <>
      <button className={styles.copyButton} type="button" onClick={handleClick}>
        {state === 'copied' ? <CheckIcon size={18} /> : <CopyIcon size={18} />}
        <span>{state === 'copied' ? copy.copied : copy.copy}</span>
      </button>
      <p className={styles.copyStatus} role="status">
        {state === 'copied' ? copy.copiedStatus : state === 'failed' ? copy.copyFailed : ''}
      </p>
    </>
  )
}
