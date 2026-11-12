import { QuoteMark } from '@/components/icons/UiIcons'
import type { ReviewView } from '@/content/types'

import styles from './ReviewList.module.css'

interface ReviewListProps {
  reviews: readonly ReviewView[]
}

/** Google reviews as quote cards. Every second card is rose. */
export function ReviewList({ reviews }: ReviewListProps) {
  if (reviews.length === 0) return null
  return (
    <ul className={styles.list}>
      {reviews.map((review, index) => (
        <li key={review.id}>
          <figure
            className={[styles.card, index % 2 === 1 ? styles.alt : ''].filter(Boolean).join(' ')}
          >
            <QuoteMark color="var(--color-moss)" />
            <blockquote className={styles.text}>{review.text}</blockquote>
            <figcaption className={styles.caption}>
              <span className={styles.author}>{review.author}</span>
              <span className={styles.source}>{review.source}</span>
            </figcaption>
          </figure>
        </li>
      ))}
    </ul>
  )
}
