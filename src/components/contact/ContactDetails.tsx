import type { ReactNode } from 'react'

import { MailIcon, MapPinIcon, PhoneIcon } from '@/components/icons/UiIcons'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { SocialButton } from '@/components/ui/SocialButton'
import { WhatsAppButton } from '@/components/ui/WhatsAppButton'
import { contactCopy } from '@/content/copy/contact'
import { sharedCopy } from '@/content/copy/shared'
import type { BusinessSettingsView } from '@/content/types'

import styles from './ContactDetails.module.css'

interface DetailProps {
  icon: ReactNode
  term: string
  children: ReactNode
}

/** One `dt`/`dd` pair, as a `<dl>` allows it: the icon disc sits inside the term. */
function Detail({ icon, term, children }: DetailProps) {
  return (
    <div className={styles.detail}>
      <dt className={styles.term}>
        <span className={styles.disc} aria-hidden="true">
          {icon}
        </span>
        {term}
      </dt>
      <dd className={styles.value}>{children}</dd>
    </div>
  )
}

/** Kontakt, left column: the WhatsApp group first, then phone, email, address and socials. */
export function ContactDetails({ settings }: { settings: BusinessSettingsView }) {
  const copy = contactCopy
  const { contact, social, whatsApp } = settings
  return (
    <div className={styles.root}>
      {whatsApp.groupUrl ? (
        <div className={styles.whatsApp}>
          <Eyebrow>{copy.whatsAppEyebrow}</Eyebrow>
          <div>
            <WhatsAppButton
              href={whatsApp.groupUrl}
              label={sharedCopy.whatsApp.bookLabel}
              ariaLabel={sharedCopy.whatsApp.bookAriaLabel}
              withArrow
            />
          </div>
          <p className={styles.hint}>{sharedCopy.whatsApp.hint}</p>
        </div>
      ) : null}
      <dl className={styles.details} aria-label={copy.details.label}>
        {contact.phoneHref && contact.phoneDisplay ? (
          <Detail icon={<PhoneIcon size={22} />} term={copy.details.phone}>
            <a className={styles.link} href={contact.phoneHref}>
              {contact.phoneDisplay}
            </a>
          </Detail>
        ) : null}
        {contact.emailHref && contact.email ? (
          <Detail icon={<MailIcon size={22} />} term={copy.details.email}>
            <a className={styles.link} href={contact.emailHref}>
              {contact.email}
            </a>
          </Detail>
        ) : null}
        {contact.street || contact.cityLine ? (
          <Detail icon={<MapPinIcon size={22} />} term={copy.details.address}>
            <address className={styles.address}>
              {contact.street}
              {contact.street && contact.cityLine ? <br /> : null}
              {contact.cityLine}
            </address>
          </Detail>
        ) : null}
      </dl>
      {social.instagramUrl || social.facebookUrl ? (
        <div className={styles.socials} role="group" aria-label={copy.socialLabel}>
          {social.instagramUrl ? (
            <SocialButton platform="instagram" href={social.instagramUrl} />
          ) : null}
          {social.facebookUrl ? (
            <SocialButton platform="facebook" href={social.facebookUrl} />
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
