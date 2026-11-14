import type { AccentHeading } from './home'
import type { CopyMediaKey } from './mediaRefs'

export interface CertificateCopy {
  image: CopyMediaKey
  caption: string
}

/** Über uns (Ueber-uns.dc.html). Address and booking details come from the admin. */
export const aboutCopy = {
  meta: {
    title: 'Über uns',
    description:
      'Liudmyla Schiemann und das Prana Yoga Studio in Essen-Borbeck: über 20 Jahre Yoga-Praxis, Yoga Alliance E-RYT 500 und YACEP.',
  },
  breadcrumb: 'Über uns',
  hero: {
    heading: {
      text: 'Liudmyla Schiemann & das',
      accent: 'Prana Yoga Studio',
    } satisfies AccentHeading,
    lead: '„Ein gesunder Geist in einem gesunden Körper – und wo das alles zusammenpasst, wohnt auch die Seele gern.“',
    image: 'aboutHero' as CopyMediaKey,
  },
  story: {
    eyebrow: 'Weg zum Yoga',
    heading: 'Seit dem 16. Lebensjahr auf der Matte',
    paragraphs: [
      'Nach meiner sportlichen Karriere in der Ukraine habe ich mit 16 Jahren Yoga für mich entdeckt. Seitdem praktiziere ich Yoga, trage es in meinem Herzen und möchte mein Wissen mit anderen Menschen teilen.',
      'Zu meiner Ausbildung gehören ein medizinischer Bachelor und ein Abschluss an der pädagogischen Universität. Zurzeit studiere ich Psychotherapie.',
    ],
    trainingEyebrow: 'Ausbildung',
    training:
      'Ausbildungen im Arhanta Yoga Ashram in den Niederlanden und bei der Ukrainian Yoga Alliance – eine qualifizierte internationale Ausbildung.',
    factsLabel: 'Liudmyla in Zahlen',
    facts: [
      { value: 'Über 20 Jahre', label: 'Praxiserfahrung' },
      { value: 'Hatha · Yin · Prenatal', label: 'Lehrerin für drei Yogastile' },
      {
        value: 'Asien',
        label: 'Retreats und Lehrgänge in Malaysia und Indonesien, Leben im Yoga-Ashram',
      },
    ],
  },
  gallery: {
    heading: 'Yoga unterwegs',
    images: [
      'galleryBeachHandstand',
      'galleryCliffBalance',
      'galleryBeachSidePlank',
      'galleryBeachArmBalance',
    ] as const satisfies readonly CopyMediaKey[],
  },
  philosophy: {
    eyebrow: 'Lebensphilosophie',
    quote:
      'Ein besonderes Anliegen ist es für mich, Yoga so zu lehren, dass die Übungen für Menschen jeden Alters geeignet und unabhängig von der persönlichen Fitness machbar sind. Yoga ist für mich mehr als körperliche Bewegung –',
    accent: 'es ist meine Lebensphilosophie.',
    author: 'Liudmyla Schiemann',
  },
  prana: {
    word: 'Prana',
    eyebrow: 'Warum Prana?',
    text: 'Weil Prana auf Sanskrit die Lebensenergie bedeutet – die Kraft, die das Fundament allen Lebens bildet: der Atem.',
  },
  certificates: {
    eyebrow: 'Zertifikate',
    heading: 'Qualifikationen',
    intro: 'Yoga Alliance E-RYT 200, E-RYT 500 und YACEP sowie die Zertifikate ihrer Ausbildungen.',
    hint: 'Tippen oder klicken Sie auf ein Zertifikat, um es in voller Größe zu sehen.',
    /** Shown on each thumbnail and, with the caption, its accessible name. */
    zoom: 'Vergrößern',
    items: [
      {
        image: 'certificateHatha',
        caption: 'Hatha Yoga Teacher Training, 200 Stunden – Arhanta Yoga Ashram, Niederlande',
      },
      { image: 'certificateYin', caption: 'Yin Yoga Teacher Training, 50 Stunden – Arhanta Yoga' },
      {
        image: 'certificatePrenatal',
        caption: 'Prenatal Yoga Teacher Training, 85 Stunden – Arhanta Yoga',
      },
      {
        image: 'certificateAppreciation',
        caption: 'Certificate of Appreciation – Ukrainian Yoga Alliance',
      },
      { image: 'certificateIntroduction', caption: 'Introduction to Yoga Theory and Practice' },
      {
        image: 'certificateIntroductionRu',
        caption: 'Einführung in Theorie und Praxis des Yoga (russischsprachiges Zertifikat)',
      },
    ] as const satisfies readonly CertificateCopy[],
    lightbox: {
      label: 'Zertifikat in voller Größe',
      close: 'Schließen',
      previous: 'Zurück',
      next: 'Weiter',
      counter: (position: number, total: number) => `Zertifikat ${position} von ${total}`,
    },
  },
  studio: {
    eyebrow: 'Das Studio',
    image: 'aboutStudio' as CopyMediaKey,
    link: 'Kontakt und Karte',
  },
  trial: {
    eyebrow: 'Einstieg',
    priceJoiner: 'für',
    text: 'Eine Stunde in einem Kurs Ihrer Wahl.',
  },
} as const
