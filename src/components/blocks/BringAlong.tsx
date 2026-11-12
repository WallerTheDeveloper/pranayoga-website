import { CheckIcon } from '@/components/icons/UiIcons'
import { Eyebrow } from '@/components/ui/Eyebrow'

import styles from './BringAlong.module.css'

interface BringAlongListProps {
  items: readonly string[]
  /** Larger type on the course overview, smaller inside the course-page card. */
  size?: 'large' | 'regular'
}

/** Ticked list: yoga mat, comfortable clothes, good mood. */
export function BringAlongList({ items, size = 'regular' }: BringAlongListProps) {
  if (items.length === 0) return null
  return (
    <ul className={`${styles.list} ${styles[size]}`}>
      {items.map((item, index) => (
        <li key={`${index}-${item}`} className={styles.item}>
          <CheckIcon size={size === 'large' ? 24 : 22} strokeWidth={2} className={styles.icon} />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  )
}

interface BringAlongCardProps {
  eyebrow: string
  heading: string
  items: readonly string[]
  headingId?: string
}

/** "Was Sie mitbringen": the outlined card on each course page. */
export function BringAlongCard({ eyebrow, heading, items, headingId }: BringAlongCardProps) {
  return (
    <div className={styles.card}>
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2 id={headingId} className={`serif ${styles.heading}`}>
        {heading}
      </h2>
      <BringAlongList items={items} />
    </div>
  )
}
