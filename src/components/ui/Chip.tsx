import Link from 'next/link'
import type { ReactNode } from 'react'

import styles from './Chip.module.css'

interface ChipProps {
  href: string
  icon: ReactNode
  children: ReactNode
  ariaLabel?: string
  /** 'end' puts the icon after the label (the 404 page's arrows). */
  iconPosition?: 'start' | 'end'
  /** A page of this site: client-side navigation. Phone and email links stay plain anchors. */
  internal?: boolean
}

/** Outline pill link: phone and email next to the WhatsApp button, or a way back on the 404 page. */
export function Chip({
  href,
  icon,
  children,
  ariaLabel,
  iconPosition = 'start',
  internal = false,
}: ChipProps) {
  const content =
    iconPosition === 'end' ? (
      <>
        <span>{children}</span>
        {icon}
      </>
    ) : (
      <>
        {icon}
        <span>{children}</span>
      </>
    )
  if (internal) {
    return (
      <Link className={styles.root} href={href} aria-label={ariaLabel}>
        {content}
      </Link>
    )
  }
  return (
    <a className={styles.root} href={href} aria-label={ariaLabel}>
      {content}
    </a>
  )
}
