import type { ReactNode } from 'react'

import styles from './Chip.module.css'

interface ChipProps {
  href: string
  icon: ReactNode
  children: ReactNode
  ariaLabel?: string
}

/** Outline pill link for phone and email. */
export function Chip({ href, icon, children, ariaLabel }: ChipProps) {
  return (
    <a className={styles.root} href={href} aria-label={ariaLabel}>
      {icon}
      <span>{children}</span>
    </a>
  )
}
