import { Eyebrow } from '@/components/ui/Eyebrow'
import { TextLink } from '@/components/ui/TextLink'
import { TreatedImage } from '@/components/ui/TreatedImage'
import { teacherCopy } from '@/content/copy/teacher'
import type { CopyImages } from '@/content/media'
import { routes } from '@/lib/routes'

import styles from './TeacherCardCompact.module.css'

interface TeacherCardCompactProps {
  images: CopyImages
}

/** The small teacher card on each course page: portrait, name, credentials, link to "Über uns". */
export function TeacherCardCompact({ images }: TeacherCardCompactProps) {
  const copy = teacherCopy
  return (
    <div className={styles.root}>
      <TreatedImage
        image={images[copy.compact.portrait]}
        sizes="96px"
        aspectRatio="4 / 5"
        zoom={false}
        className={styles.portrait}
      />
      <div className={styles.text}>
        <Eyebrow>{copy.eyebrow}</Eyebrow>
        <p className={`serif ${styles.name}`}>{copy.name}</p>
        <p className={styles.credentials}>{copy.compact.credentials}</p>
        <TextLink href={routes.about()} className={styles.more}>
          {copy.moreLink}
        </TextLink>
      </div>
    </div>
  )
}
