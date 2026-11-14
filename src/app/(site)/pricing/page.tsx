import type { Metadata } from 'next'

import { PageHero } from '@/components/blocks/PageHero'
import { TeacherTrainingTeaser } from '@/components/blocks/TeacherTrainingTeaser'
import { PriceGroupBlock } from '@/components/pricing/PriceGroupBlock'
import groupStyles from '@/components/pricing/PriceGroupBlock.module.css'
import { SignupWays } from '@/components/pricing/SignupWays'
import { Section } from '@/components/ui/Section'
import {
  getBusinessSettings,
  getCopyImages,
  getDownloads,
  getPageCopy,
  getPriceGroups,
  getTeacherTraining,
} from '@/content'
import type { PriceGroupView } from '@/content/types'
import { routes } from '@/lib/routes'

/** The first groups (trial, membership) sit above the teacher-training teaser, the rest below. */
const GROUPS_BEFORE_TEASER = 2

export async function generateMetadata(): Promise<Metadata> {
  const copy = await getPageCopy('pricing')
  return {
    title: copy.meta.title,
    description: copy.meta.description,
    alternates: { canonical: routes.pricing() },
  }
}

function GroupStack({ groups, groupUrl }: { groups: PriceGroupView[]; groupUrl: string | null }) {
  return (
    <div className={groupStyles.stack}>
      {groups.map((group) => (
        <PriceGroupBlock key={group.id} group={group} groupUrl={groupUrl} />
      ))}
    </div>
  )
}

/** Mitgliedschaft & Preise: price groups from the admin, the teaser, and the ways to sign up. */
export default async function PricingPage() {
  const [copy, settings, groups, training, downloads, images] = await Promise.all([
    getPageCopy('pricing'),
    getBusinessSettings(),
    getPriceGroups(),
    getTeacherTraining(),
    getDownloads(),
    getCopyImages(),
  ])
  const { groupUrl } = settings.whatsApp
  const first = groups.slice(0, GROUPS_BEFORE_TEASER)
  const rest = groups.slice(GROUPS_BEFORE_TEASER)

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

      {first.length > 0 ? (
        <Section flushTop reveal={false}>
          <GroupStack groups={first} groupUrl={groupUrl} />
        </Section>
      ) : null}

      {training ? (
        <Section flushTop labelledBy="teacher-training-heading">
          <TeacherTrainingTeaser training={training} headingId="teacher-training-heading" />
        </Section>
      ) : null}

      {rest.length > 0 ? (
        <Section tone="sand" paper reveal={false}>
          <GroupStack groups={rest} groupUrl={groupUrl} />
        </Section>
      ) : null}

      <Section labelledBy="signup-ways-heading">
        <SignupWays
          contract={downloads['membership-contract']}
          bank={settings.bank}
          headingId="signup-ways-heading"
        />
      </Section>
    </>
  )
}
