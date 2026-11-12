import type { AccentHeading } from './home'
import type { CopyMediaKey } from './mediaRefs'

/** Course overview copy (Kurse.dc.html). Course names, texts and prices come from the admin. */
export const coursesCopy = {
  meta: {
    title: 'Yoga-Kurse in Essen-Borbeck',
    description:
      'Alle Kurse des Prana Yoga Studio Essen im Überblick – für jedes Alter und jede Fitness. Aktuelle Kurszeiten und Probestunde über WhatsApp.',
  },
  breadcrumb: 'Kurse',
  hero: {
    heading: { text: 'Yoga-Kurse in', accent: 'Essen-Borbeck' } satisfies AccentHeading,
    lead: 'Hier finden Sie alle Kurse des Prana Yoga Studio Essen im Überblick. Wählen Sie den Kurs, der zu Ihnen passt.',
    image: 'coursesHero' as CopyMediaKey,
  },
  grid: {
    /** Not shown: names the card grid for screen readers, so the h3 cards sit under an h2. */
    heading: 'Alle Kurse',
    cardLink: 'Mehr erfahren',
    audienceTerm: 'Für wen',
  },
  times: {
    heading: 'Kurszeiten und freie Plätze',
    text: 'Die aktuellen Kurszeiten und Änderungen erfahren Sie in unserer WhatsApp-Gruppe.',
  },
  bringAlong: {
    eyebrow: 'Gut zu wissen',
    heading: 'Was benötige ich?',
    intro: 'Folgendes sollten Sie für eine Yogastunde mitbringen:',
    image: 'coursesBringAlong' as CopyMediaKey,
  },
  trial: {
    eyebrow: 'Einstieg',
    priceJoiner: 'für',
    text: 'Eine Stunde in einem Kurs Ihrer Wahl.',
  },
} as const
