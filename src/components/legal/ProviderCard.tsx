import { legalCopy } from '@/content/copy/legal'
import type { ContactData } from '@/content/types'

import styles from './LegalPage.module.css'

/** The Impressum's provider block: studio, owner, address, phone and email from the admin. */
export function ProviderCard({ contact }: { contact: ContactData }) {
  const copy = legalCopy.legalNotice.card
  const address = [contact.street, contact.cityLine].filter(Boolean).join(', ')
  return (
    <address className={styles.card} aria-label={copy.label}>
      <strong>{copy.studio}</strong>
      <span>{copy.owner}</span>
      {address ? <span>{address}</span> : null}
      {contact.phoneHref && contact.phoneDisplay ? (
        <span>
          {copy.phonePrefix} <a href={contact.phoneHref}>{contact.phoneDisplay}</a>
        </span>
      ) : null}
      {contact.emailHref && contact.email ? (
        <span>
          {copy.emailPrefix} <a href={contact.emailHref}>{contact.email}</a>
        </span>
      ) : null}
    </address>
  )
}
