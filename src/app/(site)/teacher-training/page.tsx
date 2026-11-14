import type { Metadata } from 'next'

import { PageHero } from '@/components/blocks/PageHero'
import { WhatsAppBand } from '@/components/blocks/WhatsAppBand'
import {
  BilingualBlock,
  TopicList,
  TrainingCosts,
  TrainingDates,
  TrainingFacts,
  TrainingFlyer,
  TrainingRequirements,
  TrainingSignupSteps,
} from '@/components/teacherTraining/TrainingSections'
import styles from '@/components/teacherTraining/TrainingSections.module.css'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { Section } from '@/components/ui/Section'
import {
  getBusinessSettings,
  getCopyImages,
  getDownloads,
  getPageCopy,
  getTeacherTrainingPage,
} from '@/content'
import { routes } from '@/lib/routes'

export async function generateMetadata(): Promise<Metadata> {
  const copy = await getPageCopy('teacherTraining')
  return {
    title: copy.page.meta.title,
    description: copy.page.meta.description,
    alternates: { canonical: routes.teacherTraining() },
  }
}

/**
 * Yogaausbildungen: the 200-hour teacher training. Questions go to Liudmyla's personal chat, not
 * the class group (the phone action bar switches the same way on this page).
 */
export default async function TeacherTrainingPage() {
  const [{ page: copy }, settings, training, downloads, images] = await Promise.all([
    getPageCopy('teacherTraining'),
    getBusinessSettings(),
    getTeacherTrainingPage(),
    getDownloads(),
    getCopyImages(),
  ])
  const personalChat = {
    href: settings.whatsApp.personalChatUrl,
    label: copy.whatsApp.label,
    ariaLabel: copy.whatsApp.ariaLabel,
  }
  const kicker = training.startMonthLabel
    ? `${copy.hero.label} · ${copy.hero.startPrefix} ${training.startMonthLabel}`
    : copy.hero.label
  const booking = (
    <WhatsAppBand
      groupUrl={null}
      cta={personalChat}
      contact={settings.contact}
      hint={copy.whatsApp.hint}
    />
  )

  return (
    <>
      <PageHero
        crumbs={[{ label: copy.breadcrumb }]}
        kicker={<Eyebrow>{kicker}</Eyebrow>}
        heading={copy.hero.heading.text}
        accent={copy.hero.heading.accent}
        lead={copy.hero.lead}
        image={images[copy.hero.image]}
        tight
      >
        <p className={`serif ${styles.questions}`}>{copy.hero.questionsPrompt}</p>
        {booking}
      </PageHero>

      <Section flushTop>
        <TrainingFacts training={training} />
      </Section>

      <Section tone="sand" paper labelledBy="bilingual-heading">
        <BilingualBlock headingId="bilingual-heading" />
        <TopicList training={training} headingId="topics-heading" />
      </Section>

      <Section tone="moss" labelledBy="dates-heading">
        <TrainingDates training={training} headingId="dates-heading" />
      </Section>

      <Section labelledBy="costs-heading" innerClassName={styles.twoColumns}>
        <TrainingCosts training={training} headingId="costs-heading" />
        <TrainingRequirements training={training} headingId="requirements-heading" />
      </Section>

      <Section tone="sand" paper labelledBy="training-signup-heading">
        <div className={styles.signupGrid}>
          <div className={styles.signupColumn}>
            <TrainingSignupSteps training={training} headingId="training-signup-heading" />
            <div className={styles.booking}>{booking}</div>
          </div>
          <TrainingFlyer
            training={training}
            pdfHref={downloads['teacher-training-flyer']?.href ?? null}
          />
        </div>
      </Section>
    </>
  )
}
