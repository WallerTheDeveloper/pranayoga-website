import type { ReactNode } from 'react'

import styles from './Heading.module.css'

export type HeadingLevel = 'h1' | 'h2' | 'h3'
export type HeadingSize = 'display' | 'section' | 'card' | 'cardWide'

interface HeadingProps {
  as: HeadingLevel
  size: HeadingSize
  /** Last words in italic, the design's `<em>` accent. */
  accent?: string
  /** Accent in moss green (the home hero) instead of ink. */
  accentTone?: 'ink' | 'moss'
  /** Plain text after the accent, e.g. the price in "Probestunde *für* 15 €". */
  trailing?: string
  id?: string
  className?: string
  children: ReactNode
}

export function Heading({
  as: Tag,
  size,
  accent,
  accentTone = 'ink',
  trailing,
  id,
  className,
  children,
}: HeadingProps) {
  const classes = [styles.base, styles[size], className ?? ''].filter(Boolean).join(' ')
  return (
    <Tag id={id} className={classes}>
      {children}
      {accent ? (
        <>
          {' '}
          <em className={accentTone === 'moss' ? styles.accentMoss : styles.accent}>{accent}</em>
        </>
      ) : null}
      {trailing ? ` ${trailing}` : null}
    </Tag>
  )
}
