import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { SectionIntro } from '@/components/blocks/SectionIntro'
import { TeacherTrainingTeaser } from '@/components/blocks/TeacherTrainingTeaser'
import { TrialOffer } from '@/components/blocks/TrialOffer'
import { CourseAudience } from '@/components/courses/CourseAudience'
import { CourseBenefits } from '@/components/courses/CourseBenefits'
import { CourseGrid } from '@/components/courses/CourseCard'
import { CourseFaq } from '@/components/courses/CourseFaq'
import { CourseHero } from '@/components/courses/CourseHero'
import { CourseInfoCards } from '@/components/courses/CourseInfoCards'
import { CourseSchedule, CourseSchedulePanel } from '@/components/courses/CourseSchedule'
import { CourseSteps } from '@/components/courses/CourseSteps'
import { Section } from '@/components/ui/Section'
import { TextLink } from '@/components/ui/TextLink'
import {
  getBusinessSettings,
  getCopyImages,
  getCourse,
  getPageCopy,
  getRelatedCourses,
  getTeacherTraining,
  getTrialOffer,
} from '@/content'
import type { PageCopy } from '@/content/copy'
import type { ContactData, CourseDetail, TrialOffer as TrialOfferData } from '@/content/types'
import { openGraphWithImage } from '@/lib/metadata'
import { routes } from '@/lib/routes'

interface CoursePageProps {
  params: Promise<{ slug: string }>
}

interface CourseBookingProps {
  course: CourseDetail
  trial: TrialOfferData | null
  copy: PageCopy<'course'>
  groupUrl: string | null
  contact: ContactData
  flushTop: boolean
}

/**
 * "Kurszeiten & Probestunde": the trial panel carries the schedule. Without a trial offer the
 * schedule gets its own panel; with neither there is nothing to show.
 */
function CourseBooking({ course, trial, copy, groupUrl, contact, flushTop }: CourseBookingProps) {
  if (trial) {
    return (
      <Section flushTop={flushTop} labelledBy="trial-heading">
        <TrialOffer
          trial={trial}
          eyebrow={copy.trial.eyebrow}
          priceJoiner={copy.trial.priceJoiner}
          text={copy.trial.text}
          groupUrl={groupUrl}
          contact={contact}
          hint={copy.trial.hint}
          headingId="trial-heading"
        >
          <CourseSchedule heading={copy.schedule.heading} entries={course.schedule} />
        </TrialOffer>
      </Section>
    )
  }
  if (course.schedule.length === 0) return null
  // The panel's own "Kurszeiten" label names it; a hidden heading would only repeat it.
  return (
    <Section flushTop={flushTop}>
      <CourseSchedulePanel
        heading={copy.schedule.heading}
        entries={course.schedule}
        groupUrl={groupUrl}
        contact={contact}
        hint={copy.trial.hint}
      />
    </Section>
  )
}

/**
 * No course paths at build time: each course renders on its first visit and then stays cached
 * until a publish clears it (docs/PLAN.md "Caching"). The deploy warm-up fills them from the
 * sitemap. Unknown slugs get a 404 from `getCourse`, which only accepts listed courses.
 */
export async function generateStaticParams(): Promise<{ slug: string }[]> {
  return []
}

export const dynamicParams = true

export async function generateMetadata({ params }: CoursePageProps): Promise<Metadata> {
  const { slug } = await params
  const course = await getCourse(slug)
  if (!course) return {}
  return {
    title: course.seo.title ? { absolute: course.seo.title } : course.title,
    description: course.seo.description ?? (course.hero.lead || undefined),
    alternates: { canonical: routes.course(course.slug) },
    openGraph: openGraphWithImage(course.seo.image ?? course.hero.image),
  }
}

/** One template for all six course pages (Kurs-*.dc.html). */
export default async function CoursePage({ params }: CoursePageProps) {
  const { slug } = await params
  const [course, copy, shared, settings, trial, training, related, images] = await Promise.all([
    getCourse(slug),
    getPageCopy('course'),
    getPageCopy('shared'),
    getBusinessSettings(),
    getTrialOffer(),
    getTeacherTraining(),
    getRelatedCourses(slug),
    getCopyImages(),
  ])
  if (!course) notFound()

  const { groupUrl } = settings.whatsApp
  const hasBenefits = course.benefits.items.length > 0
  const hasBooking = trial !== null || course.schedule.length > 0

  return (
    <>
      <CourseHero course={course} groupUrl={groupUrl} contact={settings.contact} />

      <Section tone="sand" paper stack="wide" labelledBy="audience-heading">
        <CourseAudience
          eyebrow={copy.audience.eyebrow}
          heading={course.audience.heading ?? copy.audience.heading}
          audience={course.audience}
          image={course.hero.secondaryImage}
          medicalNote={copy.audience.medicalNote}
          headingId="audience-heading"
        />
        <CourseSteps
          eyebrow={copy.steps.eyebrow}
          heading={course.steps.heading ?? copy.steps.eyebrow}
          items={course.steps.items}
          headingId="steps-heading"
        />
      </Section>

      {hasBenefits ? (
        <Section labelledBy="benefits-heading">
          <CourseBenefits
            eyebrow={copy.benefits.eyebrow}
            heading={course.benefits.heading ?? copy.benefits.eyebrow}
            items={course.benefits.items}
            sideImage={course.benefits.sideImage}
            headingId="benefits-heading"
          />
        </Section>
      ) : null}

      <CourseBooking
        course={course}
        trial={trial}
        copy={copy}
        groupUrl={groupUrl}
        contact={settings.contact}
        flushTop={hasBenefits}
      />

      <Section flushTop={hasBenefits || hasBooking} labelledBy="bring-along-heading">
        <CourseInfoCards
          bringAlong={{ ...copy.bringAlong, items: shared.bringAlong }}
          images={images}
          headingId="bring-along-heading"
        />
      </Section>

      {training ? (
        <Section flushTop labelledBy="teacher-training-heading">
          <TeacherTrainingTeaser training={training} headingId="teacher-training-heading" />
        </Section>
      ) : null}

      {course.faqs.length > 0 ? (
        <Section flushTop labelledBy="faq-heading">
          <CourseFaq
            eyebrow={copy.faq.eyebrow}
            heading={copy.faq.heading}
            faqs={course.faqs}
            headingId="faq-heading"
          />
        </Section>
      ) : null}

      {related.length > 0 ? (
        <Section tone="sand" paper stack labelledBy="related-heading">
          <SectionIntro
            heading={copy.related.heading}
            headingId="related-heading"
            action={<TextLink href={routes.courses()}>{copy.related.allCourses}</TextLink>}
          />
          <CourseGrid courses={related} linkLabel={copy.related.cardLink} />
        </Section>
      ) : null}
    </>
  )
}
