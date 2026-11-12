import { InfoIcon } from '@/components/icons/UiIcons'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { Heading } from '@/components/ui/Heading'
import { TreatedImage } from '@/components/ui/TreatedImage'
import type { CourseDetail, ImageData } from '@/content/types'

import styles from './CourseAudience.module.css'

interface CourseAudienceProps {
  eyebrow: string
  heading: string
  audience: CourseDetail['audience']
  image: ImageData | null
  medicalNote: string
  headingId: string
}

/**
 * "Für wen ist der Kurs?". With a photo: photo left, text right. Without one: heading left, text
 * right, as on the Rad Yoga and Yoga Sport Balance pages.
 */
export function CourseAudience({
  eyebrow,
  heading,
  audience,
  image,
  medicalNote,
  headingId,
}: CourseAudienceProps) {
  const titles = (
    <>
      <Eyebrow>{eyebrow}</Eyebrow>
      <Heading as="h2" size="section" id={headingId}>
        {heading}
      </Heading>
    </>
  )
  const body = (
    <>
      {audience.paragraphs.map((text, index) => (
        <p key={`${index}-${text}`} className={index === 0 ? styles.first : styles.paragraph}>
          {text}
        </p>
      ))}
      {audience.quote ? (
        <blockquote className={styles.quote}>
          <p>{audience.quote}</p>
        </blockquote>
      ) : null}
      <p className={styles.note}>
        <InfoIcon size={20} className={styles.noteIcon} />
        <span>{medicalNote}</span>
      </p>
    </>
  )

  if (image) {
    return (
      <div className={`${styles.split} ${styles.center}`}>
        <TreatedImage
          image={image}
          sizes="(max-width: 960px) min(440px, 100vw), 440px"
          aspectRatio="4 / 5"
          className={styles.photo}
        />
        <div className={styles.column}>
          {titles}
          {body}
        </div>
      </div>
    )
  }
  return (
    <div className={styles.split}>
      <div className={styles.column}>{titles}</div>
      <div className={styles.column}>{body}</div>
    </div>
  )
}
