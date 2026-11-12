import { BringAlongCard } from '@/components/blocks/BringAlong'
import { TeacherCardCompact } from '@/components/blocks/TeacherCardCompact'
import type { CopyImages } from '@/content/media'

import styles from './CourseInfoCards.module.css'

interface CourseInfoCardsProps {
  bringAlong: { eyebrow: string; heading: string; items: readonly string[] }
  images: CopyImages
  headingId: string
}

/** Two cards side by side on a course page: what to bring, and the teacher. */
export function CourseInfoCards({ bringAlong, images, headingId }: CourseInfoCardsProps) {
  return (
    <div className={styles.two}>
      <BringAlongCard
        eyebrow={bringAlong.eyebrow}
        heading={bringAlong.heading}
        items={bringAlong.items}
        headingId={headingId}
      />
      <TeacherCardCompact images={images} />
    </div>
  )
}
