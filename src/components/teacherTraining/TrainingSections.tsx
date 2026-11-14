import { CheckIcon, ExternalArrowIcon } from '@/components/icons/UiIcons'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { Heading } from '@/components/ui/Heading'
import { ContainedImage } from '@/components/ui/TreatedImage'
import { teacherTrainingCopy } from '@/content/copy/teacherTraining'
import type { TeacherTrainingPageView } from '@/content/types'

import styles from './TrainingSections.module.css'

const copy = teacherTrainingCopy.page

interface TrainingProps {
  training: TeacherTrainingPageView
}

interface HeadedProps extends TrainingProps {
  headingId: string
}

/** Four big numbers under the hero: hours, weekends, price, languages. */
export function TrainingFacts({ training }: TrainingProps) {
  const facts = copy.facts
  return (
    <dl className={styles.facts} aria-label={facts.label}>
      <div className={styles.fact}>
        <dt className={`serif ${styles.factValue}`}>{facts.hours.value}</dt>
        <dd className={styles.factLabel}>{facts.hours.label}</dd>
      </div>
      <div className={styles.fact}>
        <dt className={`serif ${styles.factValue}`}>{facts.weekends.value}</dt>
        <dd className={styles.factLabel}>{facts.weekends.label}</dd>
      </div>
      {training.priceLabel ? (
        <div className={styles.fact}>
          <dt className={`serif ${styles.factValue}`}>{training.priceLabel}</dt>
          <dd className={styles.factLabel}>{facts.priceLabel}</dd>
        </div>
      ) : null}
      <div className={styles.fact}>
        <dt className={`serif ${styles.factValue}`}>
          <span aria-hidden="true">{facts.languages.value}</span>
          <span className="visually-hidden">{facts.languages.spoken}</span>
        </dt>
        <dd className={styles.factLabel}>{facts.languages.label}</dd>
      </div>
    </dl>
  )
}

/** "Zweisprachiger Unterricht" with the three language pills. */
export function BilingualBlock({ headingId }: { headingId: string }) {
  const bilingual = copy.bilingual
  return (
    <div className={styles.split}>
      <div className={styles.block}>
        <Eyebrow>{bilingual.eyebrow}</Eyebrow>
        <Heading as="h2" size="section" id={headingId}>
          {bilingual.heading}
        </Heading>
        <p className={styles.body}>{bilingual.text}</p>
      </div>
      <ul className={styles.languages} aria-label={bilingual.languagesLabel}>
        {bilingual.languages.map((language) => (
          <li key={language} className={`serif ${styles.language}`}>
            {language}
          </li>
        ))}
      </ul>
    </div>
  )
}

/** "Was Sie lernen": the numbered topic cards from the admin. */
export function TopicList({ training, headingId }: HeadedProps) {
  if (training.topics.length === 0) return null
  const topics = copy.topics
  return (
    <div className={styles.topics}>
      <div className={styles.block}>
        <Eyebrow>{topics.eyebrow}</Eyebrow>
        <Heading as="h2" size="section" id={headingId}>
          {topics.heading}
        </Heading>
        <p className={styles.muted}>{topics.intro(training.topics.length)}</p>
      </div>
      <ol className={styles.topicGrid}>
        {training.topics.map((topic, index) => (
          <li key={topic.title} className={styles.topic}>
            <span className={`serif ${styles.topicNumber}`} aria-hidden="true">
              {String(index + 1).padStart(2, '0')}
            </span>
            <h3 className={`serif ${styles.topicTitle}`}>{topic.title}</h3>
            {topic.text ? <p className={styles.topicText}>{topic.text}</p> : null}
          </li>
        ))}
      </ol>
    </div>
  )
}

/** "Ihr Zeitinvestment" on moss: start and end month, then one line per weekend. */
export function TrainingDates({ training, headingId }: HeadedProps) {
  const dates = copy.dates
  const span = [
    training.startMonthLabel ? `${dates.start} ${training.startMonthLabel}` : null,
    training.endMonthLabel ? `${dates.end} ${training.endMonthLabel}` : null,
  ].filter(Boolean)
  return (
    <div className={`${styles.split} ${styles.alignStart}`}>
      <div className={styles.block}>
        <Eyebrow onDark>{dates.eyebrow}</Eyebrow>
        <Heading as="h2" size="section" id={headingId}>
          {dates.heading}
        </Heading>
        <p className={styles.onDarkText}>{dates.text}</p>
        {span.length > 0 ? <p className={styles.onDarkMeta}>{span.join(' · ')}</p> : null}
      </div>
      {training.weekends.length > 0 ? (
        <ol className={styles.weekends} aria-label={dates.listLabel}>
          {training.weekends.map((weekend, index) => (
            <li key={`${weekend}-${index}`} className={styles.weekend}>
              <span>{dates.weekend(index + 1)}</span>
              <span>{weekend}</span>
            </li>
          ))}
        </ol>
      ) : (
        <p className={styles.onDarkText}>{dates.pending}</p>
      )}
    </div>
  )
}

interface CostRow {
  term: string
  value: string | null
}

/** "Kosten": price, deposit, balance, instalments, membership discount. Empty lines are left out. */
export function TrainingCosts({ training, headingId }: HeadedProps) {
  const costs = copy.costs
  const rows: CostRow[] = [
    { term: costs.training, value: training.priceLabel },
    {
      term: costs.deposit,
      value: training.depositLabel
        ? costs.depositDue(training.depositLabel, training.depositDeadline)
        : null,
    },
    {
      term: costs.balance,
      value: training.balanceDeadline ? costs.balanceDue(training.balanceDeadline) : null,
    },
    { term: costs.instalments, value: costs.instalmentsValue },
    { term: costs.membership, value: training.membershipDiscount },
  ]
  return (
    <div className={styles.column}>
      <div className={styles.block}>
        <Eyebrow>{costs.eyebrow}</Eyebrow>
        <Heading as="h2" size="section" id={headingId}>
          {costs.heading}
        </Heading>
      </div>
      <dl className={styles.costs}>
        {rows.map((row) =>
          row.value ? (
            <div key={row.term} className={styles.costRow}>
              <dt>{row.term}</dt>
              <dd>{row.value}</dd>
            </div>
          ) : null,
        )}
      </dl>
    </div>
  )
}

/** "Während der Ausbildung": the requirements, then certification and the teacher line. */
export function TrainingRequirements({ training, headingId }: HeadedProps) {
  const requirements = copy.requirements
  return (
    <div className={styles.column}>
      <div className={styles.block}>
        <Eyebrow>{requirements.eyebrow}</Eyebrow>
        <Heading as="h2" size="section" id={headingId}>
          {requirements.heading}
        </Heading>
      </div>
      {training.requirements.length > 0 ? (
        <ul className={styles.requirements}>
          {training.requirements.map((requirement) => (
            <li key={requirement}>
              <CheckIcon size={22} className={styles.check} />
              <span>{requirement}</span>
            </li>
          ))}
        </ul>
      ) : null}
      <div className={styles.certification}>
        <p className={styles.certificationEyebrow}>{requirements.certificationEyebrow}</p>
        {training.certification ? (
          <p className={styles.certificationText}>{training.certification}</p>
        ) : null}
        <p className={styles.teacher}>{requirements.teacher}</p>
      </div>
    </div>
  )
}

/** "So melden Sie sich an": contact, register (deposit), start (first day). */
export function TrainingSignupSteps({ training, headingId }: HeadedProps) {
  const signup = copy.signup
  const steps = [
    { title: signup.contact.title, text: signup.contact.text },
    {
      title: signup.register.title,
      text: signup.register.text(training.depositLabel, training.depositDeadline),
    },
    { title: signup.start.title, text: signup.start.text(training.firstDayLabel) },
  ]
  return (
    <>
      <div className={styles.block}>
        <Eyebrow>{signup.eyebrow}</Eyebrow>
        <Heading as="h2" size="section" id={headingId}>
          {signup.heading}
        </Heading>
      </div>
      <ol className={styles.steps}>
        {steps.map((step, index) => (
          <li key={step.title} className={styles.step}>
            <span className={`serif ${styles.stepNumber}`} aria-hidden="true">
              {index + 1}
            </span>
            <div className={styles.stepText}>
              <h3 className={`serif ${styles.stepTitle}`}>{step.title}</h3>
              <p className={styles.muted}>{step.text}</p>
            </div>
          </li>
        ))}
      </ol>
    </>
  )
}

interface FlyerProps extends TrainingProps {
  /** The flyer PDF when one is uploaded; otherwise the full-size flyer image. */
  pdfHref: string | null
}

/** The flyer beside the signup steps, with "Flyer öffnen". Left out without image and file. */
export function TrainingFlyer({ training, pdfHref }: FlyerProps) {
  const href = pdfHref ?? training.flyer.imageHref
  if (!training.flyer.image && !href) return null
  return (
    <figure className={styles.flyer}>
      {training.flyer.image ? (
        <ContainedImage
          image={training.flyer.image}
          sizes="(max-width: 960px) min(420px, 100vw), 420px"
          aspectRatio={`${training.flyer.image.width} / ${training.flyer.image.height}`}
          className={styles.flyerImage}
          zoom={false}
        />
      ) : null}
      <figcaption className={styles.flyerCaption}>
        <span>{copy.flyer.caption}</span>
        {href ? (
          <a className={styles.flyerLink} href={href}>
            {copy.flyer.open}
            <ExternalArrowIcon size={16} />
          </a>
        ) : null}
      </figcaption>
    </figure>
  )
}
