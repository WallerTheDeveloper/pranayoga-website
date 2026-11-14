import { MailIcon, PhoneIcon } from '@/components/icons/UiIcons'
import { Chip } from '@/components/ui/Chip'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { TextLink } from '@/components/ui/TextLink'
import { WhatsAppButton } from '@/components/ui/WhatsAppButton'
import { sharedCopy } from '@/content/copy/shared'
import { signupCopy } from '@/content/copy/signup'
import type { ContactData } from '@/content/types'
import { routes } from '@/lib/routes'

import styles from './SignupAside.module.css'

interface SignupAsideProps {
  groupUrl: string | null
  contact: ContactData
}

/** "Gut zu wissen" beside the form: a way back to the prices and the direct contacts. */
export function SignupAside({ groupUrl, contact }: SignupAsideProps) {
  const copy = signupCopy.aside
  const hasContact = Boolean(groupUrl || contact.phoneHref || contact.emailHref)
  return (
    <aside className={styles.aside} aria-labelledby="signup-aside-title">
      <Eyebrow>{copy.eyebrow}</Eyebrow>
      <h2 id="signup-aside-title" className={`serif ${styles.title}`}>
        {copy.title}
      </h2>
      <p className={styles.text}>{copy.text}</p>
      <TextLink href={routes.pricing()} className={styles.link}>
        {copy.link}
      </TextLink>
      {hasContact ? (
        <div className={styles.contact}>
          <p className={styles.prompt}>{copy.prompt}</p>
          {groupUrl ? (
            <WhatsAppButton
              href={groupUrl}
              label={sharedCopy.whatsApp.bookLabel}
              ariaLabel={sharedCopy.whatsApp.bookAriaLabel}
              size="small"
            />
          ) : null}
          <div className={styles.chips}>
            {contact.phoneHref && contact.phoneDisplay ? (
              <Chip href={contact.phoneHref} icon={<PhoneIcon size={20} />}>
                {contact.phoneDisplay}
              </Chip>
            ) : null}
            {contact.emailHref ? (
              <Chip href={contact.emailHref} icon={<MailIcon size={20} />}>
                {sharedCopy.whatsApp.emailChip}
              </Chip>
            ) : null}
          </div>
        </div>
      ) : null}
    </aside>
  )
}
