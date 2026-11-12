import type { Metadata } from 'next'

import { PranaBand } from '@/components/blocks/PranaBand'
import { ReviewList } from '@/components/blocks/ReviewList'
import { SectionIntro } from '@/components/blocks/SectionIntro'
import { TeacherCard } from '@/components/blocks/TeacherCard'
import { TrialOffer } from '@/components/blocks/TrialOffer'
import { CourseGrid } from '@/components/courses/CourseCard'
import { HomeHero } from '@/components/home/HomeHero'
import { NewInStudio, resolveNewCourses } from '@/components/home/NewInStudio'
import { Section } from '@/components/ui/Section'
import { TextLink } from '@/components/ui/TextLink'
import {
  getBusinessSettings,
  getCopyImages,
  getCourses,
  getPageCopy,
  getReviews,
  getTrialOffer,
} from '@/content'
import { routes } from '@/lib/routes'

export async function generateMetadata(): Promise<Metadata> {
  const copy = await getPageCopy('home')
  return {
    title: { absolute: copy.meta.title },
    description: copy.meta.description,
    alternates: { canonical: routes.home() },
  }
}

export default async function HomePage() {
  const [copy, settings, courses, reviews, trial, images] = await Promise.all([
    getPageCopy('home'),
    getBusinessSettings(),
    getCourses(),
    getReviews(),
    getTrialOffer(),
    getCopyImages(),
  ])
  const { groupUrl } = settings.whatsApp
  const newCourses = resolveNewCourses(copy.newInStudio.items, courses)
  const reviewsUrl = settings.social.googleReviewsUrl

  return (
    <>
      <HomeHero
        eyebrow={copy.hero.eyebrow}
        heading={copy.hero.heading}
        lead={copy.hero.lead}
        image={images[copy.hero.image]}
        groupUrl={groupUrl}
        contact={settings.contact}
      />

      {courses.length > 0 ? (
        <Section tone="sand" paper labelledBy="courses-heading" stack>
          <SectionIntro
            eyebrow={copy.courses.eyebrow}
            heading={copy.courses.heading.text}
            accent={copy.courses.heading.accent}
            headingId="courses-heading"
            intro={copy.courses.intro}
            action={<TextLink href={routes.courses()}>{copy.courses.allCourses}</TextLink>}
          />
          <CourseGrid courses={courses} linkLabel={copy.courses.cardLink} />
        </Section>
      ) : null}

      {newCourses.length > 0 ? (
        <Section flushBottom labelledBy="new-courses-heading">
          <NewInStudio
            eyebrow={copy.newInStudio.eyebrow}
            heading={copy.newInStudio.heading}
            linkLabel={copy.newInStudio.link}
            teasers={newCourses}
            images={images}
            headingId="new-courses-heading"
          />
        </Section>
      ) : null}

      <Section labelledBy="teacher-heading">
        <TeacherCard images={images} headingId="teacher-heading" />
      </Section>

      <PranaBand word={copy.prana.word} eyebrow={copy.prana.eyebrow} text={copy.prana.text} />

      {reviews.length > 0 ? (
        <Section labelledBy="reviews-heading" stack>
          <SectionIntro
            eyebrow={copy.reviews.eyebrow}
            heading={copy.reviews.heading}
            headingId="reviews-heading"
            action={
              reviewsUrl ? (
                <TextLink href={reviewsUrl} external ariaLabel={copy.reviews.allReviewsAriaLabel}>
                  {copy.reviews.allReviews}
                </TextLink>
              ) : undefined
            }
          />
          <ReviewList reviews={reviews} />
        </Section>
      ) : null}

      {trial ? (
        <Section flushTop labelledBy="trial-heading">
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
