import type { Metadata } from 'next'

import { LegalPage } from '@/components/legal/LegalPage'
import { getLegalPage, getPageCopy } from '@/content'
import { routes } from '@/lib/routes'

export async function generateMetadata(): Promise<Metadata> {
  const copy = await getPageCopy('legal')
  return {
    title: copy.privacyPolicy.meta.title,
    description: copy.privacyPolicy.meta.description,
    alternates: { canonical: routes.privacyPolicy() },
  }
}

/** Datenschutzerklärung: the legal text from the admin (rich text). */
export default async function PrivacyPolicyPage() {
  const [copy, page] = await Promise.all([getPageCopy('legal'), getLegalPage('privacy-policy')])
  return (
    <LegalPage
      breadcrumb={copy.privacyPolicy.breadcrumb}
      heading={copy.privacyPolicy.heading}
      page={page}
    />
  )
}
