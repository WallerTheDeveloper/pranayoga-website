import { BringAlongList } from '@/components/blocks/BringAlong'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { Heading } from '@/components/ui/Heading'
import { TreatedImage } from '@/components/ui/TreatedImage'
import type { ImageData } from '@/content/types'

import styles from './WhatYouNeed.module.css'

interface WhatYouNeedProps {
  eyebrow: string
  heading: string
  intro: string
  items: readonly string[]
  image: ImageData | null
  headingId: string
}

/** "Was benötige ich?" on the course overview: photo left, ticked list right. */
export function WhatYouNeed({
  eyebrow,
  heading,
  intro,
  items,
  image,
  headingId,
}: WhatYouNeedProps) {
  return (
    <div className={styles.split}>
      <TreatedImage
        image={image}
        sizes="(max-width: 960px) min(420px, 100vw), 420px"
        aspectRatio="4 / 5"
        className={styles.photo}
      />
      <div className={styles.copy}>
        <Eyebrow>{eyebrow}</Eyebrow>
        <Heading as="h2" size="section" id={headingId}>
          {heading}
        </Heading>
        <p className={styles.intro}>{intro}</p>
        <BringAlongList items={items} size="large" />
      </div>
    </div>
  )
}
