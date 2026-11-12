import Link from 'next/link'
import type { ReactNode } from 'react'

import { ArrowIcon, ExternalArrowIcon } from '@/components/icons/UiIcons'

import styles from './TextLink.module.css'

interface TextLinkProps {
  href: string
  children: ReactNode
  /** Opens another site in a new tab, with the diagonal arrow. */
  external?: boolean
  ariaLabel?: string
  className?: string
}

export function TextLink({
  href,
  children,
  external = false,
  ariaLabel,
  className,
}: TextLinkProps) {
  const classes = [styles.root, className ?? ''].filter(Boolean).join(' ')
  if (external) {
    return (
      <a
        className={classes}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={ariaLabel}
      >
        {children}
        <ExternalArrowIcon size={18} className={styles.icon} />
      </a>
    )
  }
  return (
    <Link className={classes} href={href} aria-label={ariaLabel}>
      {children}
      <ArrowIcon size={18} className={styles.icon} />
    </Link>
  )
}
