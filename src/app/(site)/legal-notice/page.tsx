import type { Metadata } from 'next'

import { LegalPage } from '@/components/legal/LegalPage'
import { ProviderCard } from '@/components/legal/ProviderCard'
import { getBusinessSettings, getLegalPage, getPageCopy } from '@/content'
import { routes } from '@/lib/routes'

export async function generateMetadata(): Promise<Metadata> {
  const copy = await getPageCopy('legal')
  return {
    title: copy.legalNotice.meta.title,
    description: copy.legalNotice.meta.description,
    alternates: { canonical: routes.legalNotice() },
  }
}

/** Impressum: the provider card from the admin settings, then the legal text (rich text). */
export default async function LegalNoticePage() {
  const [copy, settings, page] = await Promise.all([
    getPageCopy('legal'),
    getBusinessSettings(),
    getLegalPage('legal-notice'),
  ])
  return (
    <LegalPage
      breadcrumb={copy.legalNotice.breadcrumb}
      heading={copy.legalNotice.heading}
      page={page}
    >
      <ProviderCard contact={settings.contact} />
    </LegalPage>
  )
}
