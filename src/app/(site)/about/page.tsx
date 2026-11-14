import type { Metadata } from 'next'

import {
  AboutStory,
  PhilosophyQuote,
  StudioLocation,
  TravelGallery,
} from '@/components/about/AboutSections'
import styles from '@/components/about/About.module.css'
import { CertificateGallery, type Certificate } from '@/components/about/CertificateGallery'
import { PageHero } from '@/components/blocks/PageHero'
import { PranaBand } from '@/components/blocks/PranaBand'
import { SealList } from '@/components/blocks/SealList'
import { SectionIntro } from '@/components/blocks/SectionIntro'
import { TrialOffer } from '@/components/blocks/TrialOffer'
import { Section } from '@/components/ui/Section'
import { getBusinessSettings, getCopyImages, getPageCopy, getTrialOffer } from '@/content'
import { routes } from '@/lib/routes'

export async function generateMetadata(): Promise<Metadata> {
  const copy = await getPageCopy('about')
  return {
    title: copy.meta.title,
    description: copy.meta.description,
    alternates: { canonical: routes.about() },
  }
}

/** Über uns: Liudmyla's story, travels, philosophy, Prana, certificates, studio, trial. */
export default async function AboutPage() {
  const [copy, settings, trial, images] = await Promise.all([
    getPageCopy('about'),
    getBusinessSettings(),
    getTrialOffer(),
    getCopyImages(),
  ])
  const certificates: Certificate[] = copy.certificates.items.flatMap((item) => {
    const image = images[item.image]
    return image ? [{ image, caption: item.caption }] : []
  })

  return (
    <>
      <PageHero
        crumbs={[{ label: copy.breadcrumb }]}
        heading={copy.hero.heading.text}
        accent={copy.hero.heading.accent}
        lead={copy.hero.lead}
        image={images[copy.hero.image]}
      >
        <SealList images={images} />
      </PageHero>

      <Section tone="sand" paper labelledBy="story-heading">
        <AboutStory headingId="story-heading" />
        <TravelGallery
          images={copy.gallery.images.map((key) => images[key])}
          headingId="gallery-heading"
        />
      </Section>

      <Section labelledBy="philosophy-heading">
        <PhilosophyQuote headingId="philosophy-heading" />
      </Section>

      <PranaBand word={copy.prana.word} eyebrow={copy.prana.eyebrow} text={copy.prana.text} />

      {certificates.length > 0 ? (
        <Section labelledBy="certificates-heading" innerClassName={styles.certificates}>
          <SectionIntro
            eyebrow={copy.certificates.eyebrow}
            heading={copy.certificates.heading}
            headingId="certificates-heading"
            intro={copy.certificates.intro}
          />
          <CertificateGallery certificates={certificates} />
          <p className={styles.hint}>{copy.certificates.hint}</p>
        </Section>
      ) : null}

      <Section tone="sand" paper labelledBy="studio-heading">
        <StudioLocation
          contact={settings.contact}
          image={images[copy.studio.image]}
          headingId="studio-heading"
        />
      </Section>

      {trial ? (
        <Section labelledBy="trial-heading">
          <TrialOffer
            trial={trial}
            eyebrow={copy.trial.eyebrow}
            priceJoiner={copy.trial.priceJoiner}
            text={copy.trial.text}
            groupUrl={settings.whatsApp.groupUrl}
            contact={settings.contact}
            headingId="trial-heading"
          />
        </Section>
      ) : null}
    </>
  )
}
