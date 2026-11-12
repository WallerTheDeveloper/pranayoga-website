import { ArrowIcon } from '@/components/icons/UiIcons'
import { Card } from '@/components/ui/Card'
import { Heading } from '@/components/ui/Heading'
import { IconDisc } from '@/components/ui/IconDisc'
import { Tag } from '@/components/ui/Tag'
import { TreatedImage } from '@/components/ui/TreatedImage'
import type { CourseSummary } from '@/content/types'

import styles from './CourseCard.module.css'

export type CourseCardVariant = 'plain' | 'photo'

interface CourseCardProps {
  course: CourseSummary
  linkLabel: string
  /** 'photo' (course overview): card photo on top and the "Für wen" line. */
  variant?: CourseCardVariant
  /** "Für wen", the term before the audience label on photo cards. */
  audienceTerm?: string
}

export function CourseCard({
  course,
  linkLabel,
  variant = 'plain',
  audienceTerm,
}: CourseCardProps) {
  const withPhoto = variant === 'photo'
  return (
    <Card href={course.href}>
      {withPhoto && course.cardImage ? (
        // The title says what the card is about, so the photo is decorative here.
        <TreatedImage
          image={course.cardImage}
          alt=""
          sizes="(max-width: 1100px) min(1120px, 100vw), 560px"
          aspectRatio="3 / 2"
          className={styles.photo}
        />
      ) : null}
      <div className={styles.top}>
        <IconDisc icon={course.icon} />
        {course.badge ? <Tag tone={course.badge.tone}>{course.badge.text}</Tag> : null}
      </div>
      <div className={styles.text}>
        <Heading as="h3" size="card">
          {course.title}
        </Heading>
        {course.cardTeaser ? <p className={styles.teaser}>{course.cardTeaser}</p> : null}
      </div>
      {withPhoto && audienceTerm && course.audienceLabel ? (
        <dl className={styles.facts}>
          <dt className={styles.term}>{audienceTerm}</dt>
          <dd className={styles.value}>{course.audienceLabel}</dd>
        </dl>
      ) : null}
      <div className={styles.more}>
        <span>{linkLabel}</span>
        <ArrowIcon size={22} className="card-arrow" />
      </div>
    </Card>
  )
}

interface CourseGridProps {
  courses: readonly CourseSummary[]
  linkLabel: string
  variant?: CourseCardVariant
  audienceTerm?: string
}

export function CourseGrid({
  courses,
  linkLabel,
  variant = 'plain',
  audienceTerm,
}: CourseGridProps) {
  return (
    <ul className={[styles.grid, variant === 'photo' ? styles.photoGrid : ''].join(' ')}>
      {courses.map((course) => (
        <li key={course.slug} className={styles.item}>
          <CourseCard
            course={course}
            linkLabel={linkLabel}
            variant={variant}
            audienceTerm={audienceTerm}
          />
        </li>
      ))}
    </ul>
  )
}
