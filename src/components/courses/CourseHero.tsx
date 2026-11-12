import { PageHero } from '@/components/blocks/PageHero'
import { WhatsAppBand } from '@/components/blocks/WhatsAppBand'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { IconDisc } from '@/components/ui/IconDisc'
import { TextLink } from '@/components/ui/TextLink'
import { courseCopy } from '@/content/copy/course'
import { sharedCopy } from '@/content/copy/shared'
import type { ContactData, CourseDetail, CoursePriceLine } from '@/content/types'
import { routes } from '@/lib/routes'

import styles from './CourseHero.module.css'

interface CourseHeroProps {
  course: CourseDetail
  groupUrl: string | null
  contact: ContactData
}

/** "Yoga für Jugendliche: 45 € pro Monat" */
export function priceLineText(line: CoursePriceLine): string {
  return `${line.name}: ${line.priceLabel}${line.unit ? ` ${line.unit}` : ''}`
}

/** Course page hero: icon and eyebrow, title, lead, audience tag, booking block, price line. */
export function CourseHero({ course, groupUrl, contact }: CourseHeroProps) {
  const copy = courseCopy.hero
  return (
    <PageHero
      crumbs={[{ label: sharedCopy.nav.courses, href: routes.courses() }, { label: course.title }]}
      heading={course.title}
      lead={course.hero.lead}
      image={course.hero.image}
      kicker={
        <div className={styles.kicker}>
          <IconDisc icon={course.icon} size="medium" />
          {course.hero.eyebrow ? <Eyebrow>{course.hero.eyebrow}</Eyebrow> : null}
        </div>
      }
    >
      {course.audienceLabel ? (
        <dl className={styles.facts}>
          <div className={styles.fact}>
            <dt className={styles.term}>{copy.audienceTerm}</dt>
            <dd className={styles.value}>{course.audienceLabel}</dd>
          </div>
        </dl>
      ) : null}
      <WhatsAppBand groupUrl={groupUrl} contact={contact} hint={copy.hint} />
      {course.priceLine ? (
        <p className={styles.price}>
          <span>{priceLineText(course.priceLine)}</span>
          <span aria-hidden="true"> · </span>
          <TextLink href={routes.pricing()}>{copy.allPrices}</TextLink>
        </p>
      ) : null}
    </PageHero>
  )
}
