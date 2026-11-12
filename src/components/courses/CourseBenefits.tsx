import { CheckIcon } from '@/components/icons/UiIcons'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { Heading } from '@/components/ui/Heading'
import { TreatedImage } from '@/components/ui/TreatedImage'
import type { CourseStep, ImageData } from '@/content/types'

import styles from './CourseBenefits.module.css'

interface CourseBenefitsProps {
  eyebrow: string
  heading: string
  items: readonly CourseStep[]
  sideImage: ImageData | null
  headingId: string
}

interface BenefitGroups {
  withPhoto: CourseStep[]
  plain: CourseStep[]
}

/** Benefits with a photo get a photo card; the rest go into the ticked list. */
export function groupBenefits(items: readonly CourseStep[]): BenefitGroups {
  return {
    withPhoto: items.filter((item) => item.image !== null),
    plain: items.filter((item) => item.image === null),
  }
}

function PhotoGrid({ items }: { items: readonly CourseStep[] }) {
  if (items.length === 0) return null
  return (
    <ul className={styles.photoGrid}>
      {items.map((item, index) => (
        <li key={`${index}-${item.title}`} className={styles.photoItem}>
          <TreatedImage
            image={item.image}
            sizes="(max-width: 700px) 100vw, (max-width: 1180px) 50vw, 280px"
            aspectRatio="4 / 5"
          />
          <h3 className={`serif ${styles.photoTitle}`}>{item.title}</h3>
          <p className={styles.text}>{item.text}</p>
        </li>
      ))}
    </ul>
  )
}

function TickList({ items }: { items: readonly CourseStep[] }) {
  if (items.length === 0) return null
  return (
    <ul className={styles.tickList}>
      {items.map((item, index) => (
        <li key={`${index}-${item.title}`} className={styles.tickItem}>
          <span className={styles.tick}>
            <CheckIcon size={20} />
          </span>
          <div className={styles.tickText}>
            <h3 className={`serif ${styles.tickTitle}`}>{item.title}</h3>
            <p className={styles.text}>{item.text}</p>
          </div>
        </li>
      ))}
    </ul>
  )
}

/**
 * "Wirkung". Photo cards first, then the ticked list. With a side image (Rücken Yoga,
 * Klangschalen) the list sits left and the photo right.
 */
export function CourseBenefits({
  eyebrow,
  heading,
  items,
  sideImage,
  headingId,
}: CourseBenefitsProps) {
  if (items.length === 0) return null
  const { withPhoto, plain } = groupBenefits(items)
  const content = (
    <>
      <div className={styles.titles}>
        <Eyebrow>{eyebrow}</Eyebrow>
        <Heading as="h2" size="section" id={headingId}>
          {heading}
        </Heading>
      </div>
      <PhotoGrid items={withPhoto} />
      <TickList items={plain} />
    </>
  )
  if (!sideImage) return <div className={styles.stack}>{content}</div>
  return (
    <div className={styles.split}>
      <div className={styles.column}>{content}</div>
      <div className={styles.side}>
        <TreatedImage
          image={sideImage}
          sizes="(max-width: 960px) min(520px, 100vw), 440px"
          aspectRatio="3 / 2"
          className={styles.sidePhoto}
        />
      </div>
    </div>
  )
}
