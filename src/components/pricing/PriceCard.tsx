import { CheckIcon } from '@/components/icons/UiIcons'
import { Button } from '@/components/ui/Button'
import { Tag } from '@/components/ui/Tag'
import { WhatsAppButton } from '@/components/ui/WhatsAppButton'
import { pricingCopy } from '@/content/copy/pricing'
import { sharedCopy } from '@/content/copy/shared'
import type { PriceBlockView } from '@/content/types'
import { routes } from '@/lib/routes'

import styles from './PriceCard.module.css'

interface PriceCardProps {
  block: PriceBlockView
  groupUrl: string | null
}

/**
 * One price block (design `.pcard`): name and badge, price and unit, what is included, and its
 * action. "Termin über WhatsApp" opens the group; "Online anmelden" leads to the Anmeldeformular.
 */
export function PriceCard({ block, groupUrl }: PriceCardProps) {
  const copy = pricingCopy.card
  const classes = [styles.card, block.highlighted ? styles.featured : ''].filter(Boolean).join(' ')
  return (
    <article className={classes}>
      <div className={styles.header}>
        <h3 className={`serif ${styles.name}`}>{block.name}</h3>
        {block.badge ? <Tag>{copy.badges[block.badge]}</Tag> : null}
      </div>
      <p className={styles.priceLine}>
        {block.priceLabel ? (
          <>
            <span className={`serif ${styles.price}`}>{block.priceLabel}</span>
            {block.unit ? <span className={styles.unit}>{block.unit}</span> : null}
          </>
        ) : (
          <span className={`serif ${styles.onRequest}`}>{copy.priceOnRequest}</span>
        )}
      </p>
      {block.inclusions.length > 0 ? (
        <ul className={styles.inclusions} aria-label={copy.inclusionsLabel}>
          {block.inclusions.map((item) => (
            <li key={item}>
              <CheckIcon size={20} className={styles.check} />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      ) : null}
      <div className={styles.action}>
        {block.action === 'whatsapp' ? (
          groupUrl ? (
            <WhatsAppButton
              href={groupUrl}
              label={sharedCopy.whatsApp.bookLabel}
              ariaLabel={sharedCopy.whatsApp.bookAriaLabel}
              className={styles.fullWidth}
            />
          ) : null
        ) : (
          <Button
            href={routes.signup()}
            variant="outline"
            ariaLabel={copy.signupAriaLabel(block.name)}
          >
            {copy.signup}
          </Button>
        )}
      </div>
    </article>
  )
}
