import type { Metadata } from 'next'

import { WhatsAppBand } from '@/components/blocks/WhatsAppBand'
import { StatusPage } from '@/components/status/StatusPage'
import { getBusinessSettings, getPageCopy } from '@/content'

export const metadata: Metadata = {
  title: 'Seite nicht gefunden',
  robots: { index: false, follow: true },
}

/** 404 (Fehler-404.dc.html): four ways back and the booking block. */
export default async function NotFound() {
  const [copy, settings] = await Promise.all([getPageCopy('status'), getBusinessSettings()])
  const notFound = copy.notFound
  return (
    <StatusPage
      eyebrow={notFound.eyebrow}
      heading={notFound.heading}
      lead={notFound.lead}
      mark={notFound.mark}
    >
      <WhatsAppBand groupUrl={settings.whatsApp.groupUrl} contact={settings.contact} />
    </StatusPage>
  )
}
