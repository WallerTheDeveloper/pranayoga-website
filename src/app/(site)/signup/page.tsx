import type { Metadata } from 'next'

import { PageHero } from '@/components/blocks/PageHero'
import { SignupForm } from '@/components/forms/SignupForm'
import { SignupAside } from '@/components/signup/SignupAside'
import styles from '@/components/signup/SignupAside.module.css'
import { Section } from '@/components/ui/Section'
import { getBusinessSettings, getPageCopy, getSignupPlanGroups } from '@/content'
import { routes } from '@/lib/routes'

export async function generateMetadata(): Promise<Metadata> {
  const copy = await getPageCopy('signup')
  return {
    title: copy.meta.title,
    description: copy.meta.description,
    alternates: { canonical: routes.signup() },
  }
}

/** Anmeldeformular: the binding signup, UI only until launch (docs/PLAN.md "Phase 3"). */
export default async function SignupPage() {
  const [copy, pricing, settings, planGroups] = await Promise.all([
    getPageCopy('signup'),
    getPageCopy('pricing'),
    getBusinessSettings(),
    getSignupPlanGroups(),
  ])
  const { groupUrl } = settings.whatsApp

  return (
    <>
      <PageHero
        crumbs={[{ label: pricing.breadcrumb, href: routes.pricing() }, { label: copy.breadcrumb }]}
        heading={copy.heading}
        lead={copy.lead}
        image={null}
        tight
      />
      <Section flushTop innerClassName={styles.layout}>
        <SignupForm
          planGroups={planGroups}
          bank={{ bankName: settings.bank.bankName, iban: settings.bank.iban }}
          groupUrl={groupUrl}
        />
        <SignupAside groupUrl={groupUrl} contact={settings.contact} />
      </Section>
    </>
  )
}
