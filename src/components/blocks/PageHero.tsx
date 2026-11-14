import type { ReactNode } from 'react'

import { Breadcrumbs, type Crumb } from '@/components/layout/Breadcrumbs'
import { Heading } from '@/components/ui/Heading'
import { TreatedImage } from '@/components/ui/TreatedImage'
import type { ImageData } from '@/content/types'

import styles from './PageHero.module.css'

interface PageHeroProps {
  /** Trail after "Startseite", ending with this page. */
  crumbs: readonly Crumb[]
  heading: string
  /** Italic moss words after the heading ("Essen-Borbeck"). */
  accent?: string
  lead?: string | null
  image: ImageData | null
  /** Above the heading, e.g. the course icon and eyebrow. */
  kicker?: ReactNode
  /** Under the lead: tags, the booking block, a price line. */
  children?: ReactNode
  /** Less room below (the course overview, where a sand band follows). */
  tight?: boolean
}

/** A portrait photo gets the narrow 2:3 frame, anything else the wide 3:2 one. */
export function isPortrait(image: ImageData | null): boolean {
  return image !== null && image.height > image.width
}

/**
 * Sub-page hero (design `.hero-grid`): breadcrumbs, h1 and lead left, photo with rose offset right.
 * The `in1`–`in4` and `in-img` classes play the entrance (motion.css).
 */
export function PageHero({
  crumbs,
  heading,
  accent,
  lead,
  image,
  kicker,
  children,
  tight = false,
}: PageHeroProps) {
  const portrait = isPortrait(image)
  return (
    <section>
      <div className={[styles.inner, tight ? styles.tight : ''].filter(Boolean).join(' ')}>
        <div className={styles.grid}>
          <div className={styles.copy}>
            <Breadcrumbs items={crumbs} className="in1" />
            {kicker ? <div className="in1">{kicker}</div> : null}
            <Heading as="h1" size="page" accent={accent} accentTone="moss" className="in2">
              {heading}
            </Heading>
            {lead ? <p className={`in3 ${styles.lead}`}>{lead}</p> : null}
            {children ? <div className={`in4 ${styles.extras}`}>{children}</div> : null}
          </div>
          {image ? (
            <figure className={[styles.figure, portrait ? styles.portrait : ''].join(' ')}>
              <div className={styles.offset} aria-hidden="true" />
              <TreatedImage
                image={image}
                sizes={
                  portrait
                    ? '(max-width: 960px) min(440px, 100vw), 440px'
                    : '(max-width: 960px) min(600px, 100vw), 440px'
                }
                aspectRatio={portrait ? '2 / 3' : '3 / 2'}
                className={`in-img ${styles.photo}`}
                preload
              />
            </figure>
          ) : null}
        </div>
      </div>
    </section>
  )
}
