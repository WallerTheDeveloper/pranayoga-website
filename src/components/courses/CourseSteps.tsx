import { Eyebrow } from '@/components/ui/Eyebrow'
import { Heading } from '@/components/ui/Heading'
import { TreatedImage } from '@/components/ui/TreatedImage'
import type { CourseStep } from '@/content/types'

import styles from './CourseSteps.module.css'

interface CourseStepsProps {
  eyebrow: string
  heading: string
  items: readonly CourseStep[]
  headingId: string
}

/** "01 Atmung": two digits, as in the design. */
export function stepNumber(index: number): string {
  return String(index + 1).padStart(2, '0')
}

/** "In der Stunde": numbered cards, each with an optional square photo on top. */
export function CourseSteps({ eyebrow, heading, items, headingId }: CourseStepsProps) {
  if (items.length === 0) return null
  return (
    <div className={styles.root}>
      <div className={styles.titles}>
        <Eyebrow>{eyebrow}</Eyebrow>
        <Heading as="h2" size="section" id={headingId}>
          {heading}
        </Heading>
      </div>
      <ol className={styles.list}>
        {items.map((step, index) => (
          <li key={`${index}-${step.title}`} className={styles.card}>
            {step.image ? (
              <TreatedImage
                image={step.image}
                sizes="(max-width: 700px) 100vw, (max-width: 1180px) 50vw, 300px"
                aspectRatio="1 / 1"
                className={styles.photo}
              />
            ) : null}
            {/* The list already numbers the steps for screen readers. */}
            <span className={`serif ${styles.number}`} aria-hidden="true">
              {stepNumber(index)}
            </span>
            <h3 className={`serif ${styles.title}`}>{step.title}</h3>
            <p className={styles.text}>{step.text}</p>
          </li>
        ))}
      </ol>
    </div>
  )
}
