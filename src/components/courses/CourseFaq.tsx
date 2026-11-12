import { FaqList } from '@/components/blocks/FaqList'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { Heading } from '@/components/ui/Heading'
import type { FaqEntry } from '@/content/types'

import styles from './CourseFaq.module.css'

interface CourseFaqProps {
  eyebrow: string
  heading: string
  faqs: readonly FaqEntry[]
  headingId: string
}

/** "Häufige Fragen": heading left, questions right. */
export function CourseFaq({ eyebrow, heading, faqs, headingId }: CourseFaqProps) {
  if (faqs.length === 0) return null
  return (
    <div className={styles.split}>
      <div className={styles.titles}>
        <Eyebrow>{eyebrow}</Eyebrow>
        <Heading as="h2" size="section" id={headingId}>
          {heading}
        </Heading>
      </div>
      <FaqList faqs={faqs} />
    </div>
  )
}
