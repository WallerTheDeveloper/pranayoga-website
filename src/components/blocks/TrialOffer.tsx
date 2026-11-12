import { Eyebrow } from '@/components/ui/Eyebrow'
import { Heading } from '@/components/ui/Heading'
import type { ContactData, TrialOffer as TrialOfferData } from '@/content/types'

import styles from './TrialOffer.module.css'
import { WhatsAppBand } from './WhatsAppBand'

interface TrialOfferProps {
  trial: TrialOfferData
  eyebrow: string
  /** "für", between the block name and the price. */
  priceJoiner: string
  text: string
  groupUrl: string | null
  contact: ContactData
  headingId?: string
}

/** "Probestunde für 15 €" with the booking block. Without a price the heading is just the name. */
export function TrialOffer({
  trial,
  eyebrow,
  priceJoiner,
  text,
  groupUrl,
  contact,
  headingId,
}: TrialOfferProps) {
  return (
    <div className={`${styles.panel} paper`}>
      <svg className={styles.blob} viewBox="0 0 600 600" aria-hidden="true" focusable="false">
        <path d="M421 63c66 34 120 99 131 175 11 77-21 165-79 221-58 57-142 82-222 72-81-10-158-56-191-126C27 335 38 241 83 170 128 99 207 51 285 41c48-6 92 3 136 22z" />
      </svg>
      <div className={styles.text}>
        <Eyebrow>{eyebrow}</Eyebrow>
        <Heading
          as="h2"
          size="section"
          className={styles.heading}
          id={headingId}
          accent={trial.priceLabel ? priceJoiner : undefined}
          trailing={trial.priceLabel ?? undefined}
        >
          {trial.name}
        </Heading>
        <p className={styles.description}>{text}</p>
      </div>
      <WhatsAppBand
        className={styles.booking}
        groupUrl={groupUrl}
        contact={contact}
        personalPrompt={false}
      />
    </div>
  )
}
