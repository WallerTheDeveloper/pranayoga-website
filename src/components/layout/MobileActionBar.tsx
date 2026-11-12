'use client'

import { usePathname } from 'next/navigation'

import { MailIcon, PhoneIcon } from '@/components/icons/UiIcons'
import { WhatsAppButton } from '@/components/ui/WhatsAppButton'
import { sharedCopy } from '@/content/copy/shared'
import type { ContactData } from '@/content/types'
import { isCurrentPage, routes } from '@/lib/routes'

import styles from './MobileActionBar.module.css'

interface MobileActionBarProps {
  groupUrl: string | null
  personalChatUrl: string | null
  contact: ContactData
}

/**
 * Termin / Anrufen / E-Mail at the bottom of phone screens. On the teacher-training page the
 * WhatsApp button opens the personal chat instead of the studio group.
 */
export function MobileActionBar({ groupUrl, personalChatUrl, contact }: MobileActionBarProps) {
  const pathname = usePathname()
  const bar = sharedCopy.mobileBar
  const personal = isCurrentPage(pathname, routes.teacherTraining()) && personalChatUrl !== null
  const whatsAppUrl = personal ? personalChatUrl : groupUrl
  if (!whatsAppUrl && !contact.phoneHref && !contact.emailHref) return null
  return (
    <div className={styles.root} role="region" aria-label={bar.label}>
      {whatsAppUrl ? (
        <WhatsAppButton
          href={whatsAppUrl}
          label={personal ? sharedCopy.whatsApp.personalLabel : bar.book}
          ariaLabel={
            personal ? sharedCopy.whatsApp.personalAriaLabel : sharedCopy.whatsApp.bookAriaLabel
          }
          size="bar"
        />
      ) : null}
      {contact.phoneHref && contact.phoneDisplay ? (
        <a
          className={styles.square}
          href={contact.phoneHref}
          aria-label={`${bar.callAriaPrefix} ${contact.phoneDisplay}`}
        >
          <PhoneIcon size={22} />
          <span>{bar.call}</span>
        </a>
      ) : null}
      {contact.emailHref && contact.email ? (
        <a
          className={styles.square}
          href={contact.emailHref}
          aria-label={`${bar.emailAriaPrefix} ${contact.email}`}
        >
          <MailIcon size={22} />
          <span>{bar.email}</span>
        </a>
      ) : null}
    </div>
  )
}
