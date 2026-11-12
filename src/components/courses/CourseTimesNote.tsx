import { ClockIcon } from '@/components/icons/UiIcons'
import { AdminValue } from '@/components/ui/AdminValue'
import { WhatsAppButton } from '@/components/ui/WhatsAppButton'
import { sharedCopy } from '@/content/copy/shared'

import styles from './CourseTimesNote.module.css'

interface CourseTimesNoteProps {
  heading: string
  text: string
  groupUrl: string | null
}

/** Under the course grid: times and free places are in the WhatsApp group. */
export function CourseTimesNote({ heading, text, groupUrl }: CourseTimesNoteProps) {
  return (
    <div className={styles.root}>
      <div className={styles.copy}>
        <ClockIcon size={28} className={styles.icon} />
        <div className={styles.text}>
          <p className={`serif ${styles.heading}`}>{heading}</p>
          <p className={styles.body}>{text}</p>
        </div>
      </div>
      <AdminValue value={groupUrl}>
        {(href) => (
          <WhatsAppButton
            href={href}
            label={sharedCopy.whatsApp.bookLabel}
            ariaLabel={sharedCopy.whatsApp.bookAriaLabel}
            withArrow
          />
        )}
      </AdminValue>
    </div>
  )
}
