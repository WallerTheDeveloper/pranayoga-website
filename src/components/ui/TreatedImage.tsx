import Image from 'next/image'
import type { CSSProperties } from 'react'

import type { ImageData } from '@/content/types'

import styles from './TreatedImage.module.css'

interface PhotoProps {
  image: ImageData | null
  /** next/image `sizes`, e.g. "(max-width: 960px) 100vw, 480px". */
  sizes: string
  /** CSS aspect-ratio of the frame, e.g. "3 / 4". */
  aspectRatio?: string
  /** Loads early: only for the first image above the fold. */
  preload?: boolean
  /** Hover zoom; off when the parent (a card) handles hover itself. */
  zoom?: boolean
  /** Overrides the admin alt text, e.g. "" when a caption already says it all. */
  alt?: string
  className?: string
  style?: CSSProperties
}

function Photo({
  image,
  sizes,
  aspectRatio,
  preload = false,
  zoom = true,
  alt,
  className,
  style,
  frameClass,
}: PhotoProps & { frameClass: string | undefined }) {
  const classes = [frameClass ?? '', zoom ? styles.zoom : '', className ?? '']
    .filter(Boolean)
    .join(' ')
  // Without an image the clay frame stays as a calm placeholder; it carries no meaning.
  return (
    <div
      className={classes}
      style={{ aspectRatio, ...style }}
      aria-hidden={image ? undefined : true}
    >
      {image ? (
        <Image
          src={image.src}
          alt={alt ?? image.alt}
          fill
          sizes={sizes}
          preload={preload}
          style={{ objectPosition: image.objectPosition }}
        />
      ) : null}
    </div>
  )
}

/** Photo with the house treatment (warm grade, colour wash, grain) and hover zoom. */
export function TreatedImage(props: PhotoProps) {
  return <Photo {...props} frameClass={styles.root} />
}

/** Whole image on white, no treatment: seals, certificates, logos. */
export function ContainedImage(props: PhotoProps) {
  return <Photo {...props} frameClass={styles.contained} />
}
