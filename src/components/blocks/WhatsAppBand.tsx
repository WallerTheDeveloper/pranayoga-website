import { MailIcon, PhoneIcon } from '@/components/icons/UiIcons'
import { AdminValue } from '@/components/ui/AdminValue'
import { Chip } from '@/components/ui/Chip'
import { WhatsAppButton } from '@/components/ui/WhatsAppButton'
import { sharedCopy } from '@/content/copy/shared'
import type { ContactData } from '@/content/types'

import styles from './WhatsAppBand.module.css'

/** A different WhatsApp target than the group, e.g. Liudmyla's personal chat. */
export interface WhatsAppCta {
  href: string | null
  label: string
  ariaLabel: string
}

interface WhatsAppBandProps {
  groupUrl: string | null
  /** Replaces the group button ("Termin über WhatsApp") with another chat. */
  cta?: WhatsAppCta
  contact: ContactData
  /** "Lieber persönlich?" before the chips and "E-Mail schreiben" (hero, menu); else the address. */
  personalPrompt?: boolean
  /** Line under the button; the course pages word it differently from the default. */
  hint?: string
  className?: string
}

/** The booking block: WhatsApp first, phone and email as the quieter alternatives. */
export function WhatsAppBand({
  groupUrl,
  cta,
  contact,
  personalPrompt = true,
  hint,
  className,
}: WhatsAppBandProps) {
  const copy = sharedCopy.whatsApp
  const hasChips = Boolean(contact.phoneHref || contact.emailHref)
  const button = cta ?? {
    href: groupUrl,
    label: copy.bookLabel,
    ariaLabel: copy.bookAriaLabel,
  }
  return (
    <div className={[styles.root, className ?? ''].filter(Boolean).join(' ')}>
      <AdminValue value={button.href}>
        {(href) => (
          <>
            <div className={styles.buttonRow}>
              <WhatsAppButton
                href={href}
                label={button.label}
                ariaLabel={button.ariaLabel}
                withArrow
              />
            </div>
            <p className={styles.hint}>{hint ?? copy.hint}</p>
          </>
        )}
      </AdminValue>
      {hasChips ? (
        <div className={styles.chips}>
          {personalPrompt ? <span className={styles.prompt}>{copy.personalPrompt}</span> : null}
          {contact.phoneHref && contact.phoneDisplay ? (
            <Chip href={contact.phoneHref} icon={<PhoneIcon size={20} />}>
              {contact.phoneDisplay}
            </Chip>
          ) : null}
          {contact.emailHref && contact.email ? (
            <Chip href={contact.emailHref} icon={<MailIcon size={20} />}>
              {personalPrompt ? copy.emailChip : contact.email}
            </Chip>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
