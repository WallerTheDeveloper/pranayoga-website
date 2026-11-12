import { WhatsAppBand } from '@/components/blocks/WhatsAppBand'
import { Eyebrow } from '@/components/ui/Eyebrow'
import type { ContactData, ScheduleEntry } from '@/content/types'

import styles from './CourseSchedule.module.css'

interface CourseScheduleProps {
  heading: string
  entries: readonly ScheduleEntry[]
}

/**
 * The optional "Kurszeiten" list (Komponenten.dc.html §04). Renders nothing while no times are
 * entered: then only the WhatsApp line and button remain, as on the old course pages.
 */
export function CourseSchedule({ heading, entries }: CourseScheduleProps) {
  if (entries.length === 0) return null
  return (
    <div className={styles.root}>
      <Eyebrow>{heading}</Eyebrow>
      <ul className={styles.list}>
        {entries.map((entry, index) => (
          <li key={`${index}-${entry.weekday}`} className={styles.row}>
            <span className={styles.day}>{entry.weekdayLabel}</span>
            <span>{entry.timeLabel}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

interface CourseSchedulePanelProps extends CourseScheduleProps {
  groupUrl: string | null
  contact: ContactData
  hint: string
}

/**
 * The schedule on its own rose panel, for a course page while no trial lesson is offered (the
 * trial panel normally carries the schedule).
 */
export function CourseSchedulePanel({
  heading,
  entries,
  groupUrl,
  contact,
  hint,
}: CourseSchedulePanelProps) {
  if (entries.length === 0) return null
  return (
    <div className={`${styles.panel} paper`}>
      <CourseSchedule heading={heading} entries={entries} />
      <WhatsAppBand groupUrl={groupUrl} contact={contact} personalPrompt={false} hint={hint} />
    </div>
  )
}
