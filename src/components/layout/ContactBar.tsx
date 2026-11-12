import { MailIcon, MapPinIcon, PhoneIcon } from '@/components/icons/UiIcons'
import { SocialButton } from '@/components/ui/SocialButton'
import { sharedCopy } from '@/content/copy/shared'
import type { BusinessSettingsView } from '@/content/types'

import styles from './ContactBar.module.css'

interface ContactBarProps {
  settings: BusinessSettingsView
}

/** Phone, email, address and social links. Each item hides when its admin value is empty. */
export function ContactBar({ settings }: ContactBarProps) {
  const { contact, social } = settings
  const address = [contact.street, contact.cityLine].filter(Boolean).join(', ')
  return (
    <div className={styles.root}>
      <div className={styles.inner}>
        <div className={styles.contacts}>
          {contact.phoneHref && contact.phoneDisplay ? (
            <a className={styles.link} href={contact.phoneHref}>
              <PhoneIcon size={18} />
              <span>
                {sharedCopy.contactBar.callPrefix} <strong>{contact.phoneDisplay}</strong>
              </span>
            </a>
          ) : null}
          {contact.emailHref && contact.email ? (
            <a className={styles.link} href={contact.emailHref}>
              <MailIcon size={18} />
              <span>{contact.email}</span>
            </a>
          ) : null}
        </div>
        <div className={styles.group}>
          {address ? (
            <span className={styles.address}>
              <MapPinIcon size={18} />
              <span>{address}</span>
            </span>
          ) : null}
          {social.instagramUrl || social.facebookUrl ? (
            <span className={styles.socials}>
              {social.instagramUrl ? (
                <SocialButton platform="instagram" href={social.instagramUrl} size="small" />
              ) : null}
              {social.facebookUrl ? (
                <SocialButton platform="facebook" href={social.facebookUrl} size="small" />
              ) : null}
            </span>
          ) : null}
        </div>
      </div>
    </div>
  )
}
