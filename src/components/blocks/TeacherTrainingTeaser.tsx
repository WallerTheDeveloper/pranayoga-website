import { CourseIcon } from '@/components/icons/CourseIcons'
import { CertificateIcon } from '@/components/icons/UiIcons'
import { Button } from '@/components/ui/Button'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { teacherTrainingCopy } from '@/content/copy/teacherTraining'
import type { TeacherTrainingView } from '@/content/types'
import { routes } from '@/lib/routes'

import styles from './TeacherTrainingTeaser.module.css'

interface TeacherTrainingTeaserProps {
  training: TeacherTrainingView
  headingId?: string
}

/** "Yogaausbildung · Start März 2027" */
export function teaserEyebrow(startMonthLabel: string | null): string {
  const { label, startPrefix } = teacherTrainingCopy.teaser
  return startMonthLabel ? `${label} · ${startPrefix} ${startMonthLabel}` : label
}

/**
 * The shared moss block that leads to the teacher training (Komponenten.dc.html §07): on every
 * course page and the course overview. The price is the last fact, shown once it is set.
 */
export function TeacherTrainingTeaser({ training, headingId }: TeacherTrainingTeaserProps) {
  const { teaser, priceLabel } = training
  const hasFacts = teaser.facts.length > 0 || priceLabel !== null
  return (
    <div className={styles.panel}>
      <CourseIcon name="teens" size={420} strokeWidth={0.9} className={styles.sprout} />
      <div className={styles.split}>
        <div className={styles.copy}>
          <Eyebrow onDark className={styles.eyebrow}>
            <CertificateIcon size={22} />
            <span>{teaserEyebrow(training.startMonthLabel)}</span>
          </Eyebrow>
          <h2 id={headingId} className={`serif ${styles.heading}`}>
            {teaser.heading}
          </h2>
          {teaser.text ? <p className={styles.text}>{teaser.text}</p> : null}
          <div className={styles.action}>
            <Button href={routes.teacherTraining()} variant="light" withArrow>
              {teacherTrainingCopy.teaser.button}
            </Button>
          </div>
        </div>
        {hasFacts ? (
          <dl className={styles.facts}>
            {teaser.facts.map((fact, index) => (
              <div key={`${index}-${fact.value}`} className={styles.fact}>
                <dt className={`serif ${styles.value}`}>{fact.value}</dt>
                <dd className={styles.label}>{fact.label}</dd>
              </div>
            ))}
            {priceLabel ? (
              <div className={styles.fact}>
                <dt className={`serif ${styles.value}`}>{priceLabel}</dt>
                <dd className={styles.label}>
                  {teaser.priceNote ?? teacherTrainingCopy.teaser.priceTerm}
                </dd>
              </div>
            ) : null}
          </dl>
        ) : null}
      </div>
    </div>
  )
}
