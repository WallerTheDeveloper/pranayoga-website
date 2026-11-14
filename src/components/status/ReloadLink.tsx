'use client'

import { usePathname } from 'next/navigation'

import { buttonClassName } from '@/components/ui/Button'
import { statusCopy } from '@/content/copy/status'

import styles from './StatusPage.module.css'

/** A full reload of the current address: a plain link, so it works even if scripts failed. */
export function ReloadLink() {
  const pathname = usePathname()
  return (
    <a className={buttonClassName('dark', styles.reload)} href={pathname || '/'}>
      {statusCopy.error.reload}
    </a>
  )
}
