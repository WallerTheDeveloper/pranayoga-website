import type { ReactNode } from 'react'

import { Eyebrow } from '@/components/ui/Eyebrow'
import { Heading } from '@/components/ui/Heading'

import styles from './SectionIntro.module.css'

interface SectionIntroProps {
  eyebrow: string
  heading: string
  accent?: string
  headingId?: string
  intro?: string
  /** Link (or anything) under the intro, right-aligned on wide screens. */
  action?: ReactNode
}

export function SectionIntro({
  eyebrow,
  heading,
  accent,
  headingId,
  intro,
  action,
}: SectionIntroProps) {
  return (
    <div className={styles.root}>
      <div className={styles.titles}>
        <Eyebrow>{eyebrow}</Eyebrow>
        <Heading as="h2" size="section" accent={accent} id={headingId}>
          {heading}
        </Heading>
      </div>
      {intro || action ? (
        <div className={styles.aside}>
          {intro ? <p className={styles.intro}>{intro}</p> : null}
          {action}
        </div>
      ) : null}
    </div>
  )
}
