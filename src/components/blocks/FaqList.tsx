import { PlusIcon } from '@/components/icons/UiIcons'
import type { FaqEntry } from '@/content/types'

import styles from './FaqList.module.css'

interface FaqListProps {
  faqs: readonly FaqEntry[]
}

/**
 * Questions as native `details`/`summary`: keyboard and screen-reader support without JavaScript.
 * The first answer starts open, as in the design.
 */
export function FaqList({ faqs }: FaqListProps) {
  if (faqs.length === 0) return null
  return (
    <div className={styles.list}>
      {faqs.map((faq, index) => (
        <details key={`${index}-${faq.question}`} className={styles.item} open={index === 0}>
          <summary className={`serif ${styles.summary}`}>
            <span>{faq.question}</span>
            <PlusIcon size={24} strokeWidth={1.8} className={styles.icon} />
          </summary>
          <div className={styles.answer}>
            <p>{faq.answer}</p>
          </div>
        </details>
      ))}
    </div>
  )
}
