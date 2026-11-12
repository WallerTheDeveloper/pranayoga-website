import Image from 'next/image'

import { QuoteMark } from '@/components/icons/UiIcons'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { Heading } from '@/components/ui/Heading'
import { TextLink } from '@/components/ui/TextLink'
import { TreatedImage } from '@/components/ui/TreatedImage'
import type { CopyImages } from '@/content/media'
import { teacherCopy } from '@/content/copy/teacher'
import { routes } from '@/lib/routes'

import styles from './TeacherCard.module.css'

interface TeacherCardProps {
  images: CopyImages
  headingId?: string
}

/** Liudmyla's portrait, bio, quote and her three Yoga Alliance seals. */
export function TeacherCard({ images, headingId }: TeacherCardProps) {
  const copy = teacherCopy
  return (
    <div className={styles.split}>
      <TreatedImage
        image={images[copy.portrait]}
        sizes="(max-width: 960px) min(440px, 100vw), 440px"
        aspectRatio="4 / 5"
        className={styles.portrait}
      />
      <div className={styles.body}>
        <div className={styles.intro}>
          <Eyebrow>{copy.eyebrow}</Eyebrow>
          <Heading as="h2" size="section" id={headingId}>
            {copy.name}
          </Heading>
          <p className={styles.experience}>{copy.experience}</p>
          <p className={styles.bio}>{copy.bio}</p>
        </div>
        <blockquote className={styles.quote}>
          <QuoteMark color="var(--color-clay)" className={styles.quoteMark} />
          <p className={`serif ${styles.quoteText}`}>{copy.quote}</p>
        </blockquote>
        <ul className={styles.seals} aria-label={copy.sealsLabel}>
          {copy.seals.map((seal) => {
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
        <TextLink href={routes.about()} className={styles.more}>
          {copy.moreLink}
        </TextLink>
      </div>
    </div>
  )
}
