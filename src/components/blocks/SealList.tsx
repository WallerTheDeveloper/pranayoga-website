import Image from 'next/image'

import type { CopyImages } from '@/content/media'
import { teacherCopy } from '@/content/copy/teacher'

import styles from './SealList.module.css'

interface SealListProps {
  images: CopyImages
  className?: string
}

/** Liudmyla's three Yoga Alliance seals (teacher card and the About hero). */
export function SealList({ images, className }: SealListProps) {
  return (
    <ul
      className={[styles.seals, className ?? ''].filter(Boolean).join(' ')}
      aria-label={teacherCopy.sealsLabel}
    >
      {teacherCopy.seals.map((seal) => {
        const image = images[seal.image]
        return (
          <li key={seal.title} className={styles.seal}>
            {image ? (
              <span className={styles.sealImage}>
                {/* The title below names the seal, so the image itself is decorative. */}
                <Image src={image.src} alt="" fill sizes="88px" />
              </span>
            ) : null}
            <span className={`serif ${styles.sealTitle}`}>{seal.title}</span>
            <span className={styles.sealIssuer}>{seal.issuer}</span>
          </li>
        )
      })}
    </ul>
  )
}
