import { ArrowIcon } from '@/components/icons/UiIcons'
import { Card } from '@/components/ui/Card'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { Heading } from '@/components/ui/Heading'
import { Tag } from '@/components/ui/Tag'
import { TreatedImage } from '@/components/ui/TreatedImage'
import type { AccentHeading, NewCourseTeaser } from '@/content/copy/home'
import type { CopyImages } from '@/content/media'
import type { CourseSummary } from '@/content/types'

import styles from './NewInStudio.module.css'

export interface ResolvedTeaser {
  item: NewCourseTeaser
  href: string
}

/**
 * Teasers whose course is published, with the course link. The page renders the section only when
 * this is non-empty, so no landmark points at a missing heading.
 */
export function resolveNewCourses(
  items: readonly NewCourseTeaser[],
  courses: readonly CourseSummary[],
): ResolvedTeaser[] {
  return items.flatMap((item) => {
    const course = courses.find((candidate) => candidate.slug === item.courseSlug)
    return course ? [{ item, href: course.href }] : []
  })
}

interface NewInStudioProps {
  eyebrow: string
  heading: AccentHeading
  linkLabel: string
  teasers: readonly ResolvedTeaser[]
  images: CopyImages
  headingId: string
}

export function NewInStudio({
  eyebrow,
  heading,
  linkLabel,
  teasers,
  images,
  headingId,
}: NewInStudioProps) {
  if (teasers.length === 0) return null
  return (
    <div className={styles.stack}>
      <div className={styles.titles}>
        <Eyebrow>{eyebrow}</Eyebrow>
        <Heading as="h2" size="section" accent={heading.accent} id={headingId}>
          {heading.text}
        </Heading>
      </div>
      <div className={styles.two}>
        {teasers.map(({ item, href }) => (
          <Card key={item.courseSlug} href={href} className={styles.card}>
            <TreatedImage
              image={images[item.image]}
              sizes="(max-width: 760px) 40vw, 260px"
              aspectRatio="3 / 4"
              className={styles.photo}
            />
            <div className={styles.body}>
              <Tag tone="dark" className={styles.tag}>
                {item.badge}
              </Tag>
              <Heading as="h3" size="cardWide">
                {item.title}
              </Heading>
              <p className={styles.text}>{item.text}</p>
              <span className={styles.link}>
                {linkLabel}
                <ArrowIcon size={20} className="card-arrow" />
              </span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
