import Link from 'next/link'
import type { CSSProperties, ReactNode } from 'react'

import styles from './Card.module.css'

interface CardProps {
  href: string
  className?: string
  style?: CSSProperties
  children: ReactNode
}

/**
 * The whole card is one link. Put an `ArrowIcon` with className `card-arrow` inside to get the
 * hover nudge; an `IconDisc` inside turns moss on hover.
 */
export function Card({ href, className, style, children }: CardProps) {
  return (
    <Link
      className={[styles.root, className ?? ''].filter(Boolean).join(' ')}
      href={href}
      style={style}
    >
      {children}
    </Link>
  )
}
