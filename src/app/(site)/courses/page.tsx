import type { Metadata } from 'next'

import { PageHero } from '@/components/blocks/PageHero'
import { TeacherTrainingTeaser } from '@/components/blocks/TeacherTrainingTeaser'
import { TrialOffer } from '@/components/blocks/TrialOffer'
import { CourseGrid } from '@/components/courses/CourseCard'
import { CourseTimesNote } from '@/components/courses/CourseTimesNote'
import { WhatYouNeed } from '@/components/courses/WhatYouNeed'
import { Section } from '@/components/ui/Section'
import {
  getBusinessSettings,
  getCopyImages,
  getCourses,
  getPageCopy,
  getTeacherTraining,
  getTrialOffer,
} from '@/content'
import { routes } from '@/lib/routes'

export async function generateMetadata(): Promise<Metadata> {
  const copy = await getPageCopy('courses')
  return {
    title: copy.meta.title,
    description: copy.meta.description,
    alternates: { canonical: routes.courses() },
  }
}

/** Kurse: every course as a photo card, what to bring, the teacher training and the trial offer. */
export default async function CoursesPage() {
  const [copy, shared, settings, courses, trial, training, images] = await Promise.all([
    getPageCopy('courses'),
    getPageCopy('shared'),
    getBusinessSettings(),
    getCourses(),
    getTrialOffer(),
    getTeacherTraining(),
    getCopyImages(),
  ])
  const { groupUrl } = settings.whatsApp

  return (
    <>
      <PageHero
        crumbs={[{ label: copy.breadcrumb }]}
        heading={copy.hero.heading.text}
        accent={copy.hero.heading.accent}
        lead={copy.hero.lead}
        image={images[copy.hero.image]}
        tight
      />

      <Section tone="sand" paper labelledBy="course-list-heading">
        <h2 id="course-list-heading" className="visually-hidden">
          {copy.grid.heading}
        </h2>
        <CourseGrid
          courses={courses}
          linkLabel={copy.grid.cardLink}
          variant="photo"
          audienceTerm={copy.grid.audienceTerm}
        />
        <CourseTimesNote heading={copy.times.heading} text={copy.times.text} groupUrl={groupUrl} />
      </Section>

      <Section flushBottom labelledBy="bring-along-heading">
        <WhatYouNeed
          eyebrow={copy.bringAlong.eyebrow}
          heading={copy.bringAlong.heading}
          intro={copy.bringAlong.intro}
          items={shared.bringAlong}
          image={images[copy.bringAlong.image]}
          headingId="bring-along-heading"
        />
      </Section>

      {training ? (
        <Section labelledBy="teacher-training-heading">
          <TeacherTrainingTeaser training={training} headingId="teacher-training-heading" />
        </Section>
      ) : null}

      {trial ? (
        <Section flushTop={training !== null} labelledBy="trial-heading">
          <TrialOffer
            trial={trial}
            eyebrow={copy.trial.eyebrow}
            priceJoiner={copy.trial.priceJoiner}
            text={copy.trial.text}
            groupUrl={groupUrl}
            contact={settings.contact}
            headingId="trial-heading"
          />
        </Section>
      ) : null}
    </>
  )
}
