import type { Metadata } from 'next'

import { PageHero } from '@/components/blocks/PageHero'
import { ContactDetails } from '@/components/contact/ContactDetails'
import styles from '@/components/contact/ContactDetails.module.css'
import { MapConsent } from '@/components/contact/MapConsent'
import { ContactForm } from '@/components/forms/ContactForm'
import { Heading } from '@/components/ui/Heading'
import { Section } from '@/components/ui/Section'
import { getBusinessSettings, getCopyImages, getPageCopy, getTechnicalSettings } from '@/content'
import { routes } from '@/lib/routes'

export async function generateMetadata(): Promise<Metadata> {
  const copy = await getPageCopy('contact')
  return {
    title: copy.meta.title,
    description: copy.meta.description,
    alternates: { canonical: routes.contact() },
  }
}

/** Kontakt: WhatsApp, phone, email, the (UI-only) form, and the map behind a consent click. */
export default async function ContactPage() {
  const [copy, settings, technical, images] = await Promise.all([
    getPageCopy('contact'),
    getBusinessSettings(),
    getTechnicalSettings(),
    getCopyImages(),
  ])
  const { contact } = settings
  const address = [contact.street, contact.cityLine].filter(Boolean).join(', ')

  return (
    <>
      <PageHero
        crumbs={[{ label: copy.breadcrumb }]}
        heading={copy.heading}
        lead={copy.lead}
        image={images[copy.image]}
        tight
      />

      <Section flushTop innerClassName={styles.layout}>
        <ContactDetails settings={settings} />
        <ContactForm groupUrl={settings.whatsApp.groupUrl} />
      </Section>

      {address ? (
        <Section flushTop labelledBy="directions-heading" innerClassName={styles.directions}>
          <Heading as="h2" size="section" id="directions-heading">
            {copy.map.heading}
          </Heading>
          <MapConsent
            embedUrl={technical.googleMapsEmbedUrl}
            address={address}
            privacyHref={routes.privacyPolicy()}
          />
        </Section>
      ) : null}
    </>
  )
}
