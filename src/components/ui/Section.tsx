import type { ReactNode } from 'react'

import styles from './Section.module.css'

export type SectionTone = 'linen' | 'sand' | 'moss'

interface SectionProps {
  tone?: SectionTone
  /** Paper grain overlay; the design uses it on sand bands. */
  paper?: boolean
  flushTop?: boolean
  flushBottom?: boolean
  /** Stacks the children with the 48 px section rhythm; 'wide' for whole blocks (56–96 px). */
  stack?: boolean | 'wide'
  labelledBy?: string
  /** Fades the content in when it scrolls into view (ScrollReveal). On by default. */
  reveal?: boolean
  className?: string
  innerClassName?: string
  children: ReactNode
}

export function Section({
  tone = 'linen',
  paper = false,
  flushTop = false,
  flushBottom = false,
  stack = false,
  labelledBy,
  reveal = true,
  className,
  innerClassName,
  children,
}: SectionProps) {
  const bandClasses = [
    styles.band,
    tone === 'sand' ? styles.sand : '',
    tone === 'moss' ? styles.moss : '',
    paper ? 'paper' : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ')
  const innerClasses = [
    styles.inner,
    flushTop ? styles.flushTop : '',
    flushBottom ? styles.flushBottom : '',
    stack ? styles.stack : '',
    stack === 'wide' ? styles.wide : '',
    reveal ? 'rv' : '',
    innerClassName ?? '',
  ]
    .filter(Boolean)
    .join(' ')
  return (
    <section className={bandClasses} aria-labelledby={labelledBy}>
      <div className={innerClasses}>{children}</div>
    </section>
  )
}
