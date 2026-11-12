import { ArrowIcon } from '@/components/icons/UiIcons'
import { Card } from '@/components/ui/Card'
import { Heading } from '@/components/ui/Heading'
import { IconDisc } from '@/components/ui/IconDisc'
import { Tag } from '@/components/ui/Tag'
import type { CourseSummary } from '@/content/types'

import styles from './CourseCard.module.css'

interface CourseCardProps {
  course: CourseSummary
  linkLabel: string
}

export function CourseCard({ course, linkLabel }: CourseCardProps) {
  return (
    <Card href={course.href}>
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
}

export function CourseGrid({ courses, linkLabel }: CourseGridProps) {
  return (
    <div className={styles.grid}>
      {courses.map((course) => (
        <CourseCard key={course.slug} course={course} linkLabel={linkLabel} />
      ))}
    </div>
  )
}
