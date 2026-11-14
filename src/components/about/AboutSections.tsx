import { MapPinIcon } from '@/components/icons/UiIcons'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { Heading } from '@/components/ui/Heading'
import { TextLink } from '@/components/ui/TextLink'
import { TreatedImage } from '@/components/ui/TreatedImage'
import { aboutCopy } from '@/content/copy/about'
import { sharedCopy } from '@/content/copy/shared'
import type { ContactData, ImageData } from '@/content/types'
import { routes } from '@/lib/routes'

import styles from './About.module.css'

/** "Weg zum Yoga": her story and training on the left, three facts on the right. */
export function AboutStory({ headingId }: { headingId: string }) {
  const copy = aboutCopy.story
  return (
    <div className={styles.storyGrid}>
      <div className={styles.storyText}>
        <div className={styles.block}>
          <Eyebrow>{copy.eyebrow}</Eyebrow>
          <Heading as="h2" size="section" id={headingId}>
            {copy.heading}
          </Heading>
          {copy.paragraphs.map((paragraph, index) => (
            <p key={paragraph} className={index === 0 ? styles.body : styles.muted}>
              {paragraph}
            </p>
          ))}
        </div>
        <div className={`${styles.block} ${styles.training}`}>
          <Eyebrow>{copy.trainingEyebrow}</Eyebrow>
          <p className={styles.muted}>{copy.training}</p>
        </div>
      </div>
      <dl className={styles.facts} aria-label={copy.factsLabel}>
        {copy.facts.map((fact) => (
          <div key={fact.value} className={styles.fact}>
            <dt className={`serif ${styles.factValue}`}>{fact.value}</dt>
            <dd className={styles.factLabel}>{fact.label}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}

interface TravelGalleryProps {
  images: readonly (ImageData | null)[]
  headingId: string
}

/** "Yoga unterwegs": four portrait photos from her travels. Missing photos are left out. */
export function TravelGallery({ images, headingId }: TravelGalleryProps) {
  const present = images.filter((image): image is ImageData => image !== null)
  if (present.length === 0) return null
  return (
    <div className={styles.gallery}>
      <h3 id={headingId} className={styles.galleryHeading}>
        {aboutCopy.gallery.heading}
      </h3>
      <ul className={styles.galleryGrid} aria-labelledby={headingId}>
        {present.map((image) => (
          <li key={image.src}>
            <TreatedImage
              image={image}
              sizes="(max-width: 700px) 45vw, (max-width: 1280px) 25vw, 300px"
              aspectRatio="4 / 5"
            />
          </li>
        ))}
      </ul>
    </div>
  )
}

/** "Lebensphilosophie": her credo as a large centred quote. */
export function PhilosophyQuote({ headingId }: { headingId: string }) {
  const copy = aboutCopy.philosophy
  return (
    <figure className={styles.philosophy}>
      <h2 id={headingId} className={styles.philosophyEyebrow}>
        {copy.eyebrow}
      </h2>
      <blockquote className={styles.quote}>
        <p className="serif">
          „{copy.quote} <em>{copy.accent}</em>“
        </p>
      </blockquote>
      <figcaption className={styles.author}>{copy.author}</figcaption>
    </figure>
  )
}

interface StudioLocationProps {
  contact: ContactData
  image: ImageData | null
  headingId: string
}

/** "Das Studio": a class photo, the address and a link to Kontakt with the map. */
export function StudioLocation({ contact, image, headingId }: StudioLocationProps) {
  const copy = aboutCopy.studio
  const heading =
    contact.street && contact.city ? `${contact.street}, ${contact.city}` : sharedCopy.brand.name
  const address = [contact.street, contact.cityLine].filter(Boolean).join(', ')
  return (
    <div className={styles.studio}>
      <TreatedImage
        image={image}
        sizes="(max-width: 960px) min(560px, 100vw), 560px"
        aspectRatio="3 / 2"
        className={styles.studioPhoto}
      />
      <div className={styles.block}>
        <Eyebrow>{copy.eyebrow}</Eyebrow>
        <Heading as="h2" size="section" id={headingId}>
          {heading}
        </Heading>
        {address ? (
          <p className={styles.address}>
            <MapPinIcon size={22} className={styles.addressIcon} />
            <span>{address}</span>
          </p>
        ) : null}
        <TextLink href={routes.contact()} className={styles.studioLink}>
          {copy.link}
        </TextLink>
      </div>
    </div>
  )
}
