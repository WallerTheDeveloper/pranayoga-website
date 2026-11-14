import { WhatsAppBand } from '@/components/blocks/WhatsAppBand'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { Heading } from '@/components/ui/Heading'
import { TreatedImage } from '@/components/ui/TreatedImage'
import type { AccentHeading } from '@/content/copy/home'
import type { ContactData, ImageData } from '@/content/types'

import styles from './HomeHero.module.css'

interface HomeHeroProps {
  eyebrow: string
  heading: AccentHeading
  lead: string
  image: ImageData | null
  groupUrl: string | null
  contact: ContactData
}

export function HomeHero({ eyebrow, heading, lead, image, groupUrl, contact }: HomeHeroProps) {
  return (
    <section>
      <div className={styles.inner}>
        <div className={styles.grid}>
          <div className={styles.copy}>
            <Eyebrow className="in1">{eyebrow}</Eyebrow>
            <Heading
              as="h1"
              size="display"
              accent={heading.accent}
              accentTone="moss"
              className="in2"
            >
              {heading.text}
            </Heading>
            <p className={`in3 ${styles.lead}`}>{lead}</p>
            <WhatsAppBand groupUrl={groupUrl} contact={contact} className="in4" />
          </div>
          <figure className={styles.figure}>
            <div className={styles.offset} aria-hidden="true" />
            <TreatedImage
              image={image}
              sizes="(max-width: 960px) min(480px, 100vw), 480px"
              aspectRatio="3 / 4"
              className={`in-img ${styles.photo}`}
              preload
            />
          </figure>
        </div>
      </div>
    </section>
  )
}
