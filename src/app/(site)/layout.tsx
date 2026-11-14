import type { Metadata, Viewport } from 'next'
import { draftMode } from 'next/headers'
import type { ReactNode } from 'react'

import '@/styles/tokens.css'
import '@/styles/base.css'
import '@/styles/motion.css'

import { ContactBar } from '@/components/layout/ContactBar'
import { LivePreviewListener } from '@/components/layout/LivePreviewListener'
import { MobileActionBar } from '@/components/layout/MobileActionBar'
import { SiteFooter } from '@/components/layout/SiteFooter'
import { SiteHeader } from '@/components/layout/SiteHeader'
import { IntroLoader } from '@/components/motion/IntroLoader'
import { PageTransition } from '@/components/motion/PageTransition'
import { ScrollReveal } from '@/components/motion/ScrollReveal'
import { getBusinessSettings, getCourses, getTechnicalSettings } from '@/content'
import { sharedCopy } from '@/content/copy/shared'
import { getServerEnv } from '@/lib/env'

import { atkinson, fraunces } from './fonts'

/**
 * Pages stay cached until a publish clears them, but the footer shows the current year, so
 * every page also re-renders once a day (plan: "Caching" → dates). Content reads stay cached.
 */
export const revalidate = 86400

const MAIN_CONTENT_ID = 'main-content'

export const viewport: Viewport = {
  themeColor: '#f6f0e6',
}

export async function generateMetadata(): Promise<Metadata> {
  const technical = await getTechnicalSettings()
  const shareImage = technical.defaultSeo.image
  return {
    metadataBase: new URL(technical.siteUrl),
    title: { default: sharedCopy.brand.name, template: `%s · ${sharedCopy.brand.name}` },
    description: technical.defaultSeo.description ?? undefined,
    robots: technical.noindex ? { index: false, follow: false } : undefined,
    openGraph: {
      siteName: sharedCopy.brand.name,
      locale: 'de_DE',
      type: 'website',
      images: shareImage ? [{ url: shareImage.src, alt: shareImage.alt }] : undefined,
    },
  }
}

export default async function SiteLayout({ children }: { children: ReactNode }) {
  const [settings, technical, courses, draft] = await Promise.all([
    getBusinessSettings(),
    getTechnicalSettings(),
    getCourses(),
    draftMode(),
  ])
  const year = new Date().getFullYear()
  return (
    // The intro script and ScrollReveal add classes to <html> before React hydrates it.
    <html
      lang="de"
      className={`${fraunces.variable} ${atkinson.variable}`}
      suppressHydrationWarning
    >
      <body>
        {technical.featureFlags.introLoader ? <IntroLoader word={sharedCopy.introWord} /> : null}
        <a className="skip-link" href={`#${MAIN_CONTENT_ID}`}>
          {sharedCopy.skipLink}
        </a>
        <div className="page paper">
          <ContactBar settings={settings} />
          <SiteHeader settings={settings} courses={courses} />
          <main id={MAIN_CONTENT_ID} tabIndex={-1}>
            <PageTransition>{children}</PageTransition>
          </main>
          <SiteFooter settings={settings} courses={courses} year={year} />
          <MobileActionBar
            groupUrl={settings.whatsApp.groupUrl}
            personalChatUrl={settings.whatsApp.personalChatUrl}
            contact={settings.contact}
          />
        </div>
        <ScrollReveal />
        {draft.isEnabled ? (
          <LivePreviewListener serverURL={getServerEnv().NEXT_PUBLIC_SERVER_URL} />
        ) : null}
      </body>
    </html>
  )
}
