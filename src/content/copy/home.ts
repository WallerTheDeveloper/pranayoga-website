import type { CopyMediaKey } from './mediaRefs'

/** A heading whose last words are set in italic (the design's `<em>` accent). */
export interface AccentHeading {
  text: string
  accent: string
}

export interface NewCourseTeaser {
  /** Shown only while this course is published. */
  courseSlug: string
  badge: string
  title: string
  text: string
  image: CopyMediaKey
}

/** Home page copy (Startseite.dc.html). Admin data (courses, reviews, prices) is not in here. */
export const homeCopy = {
  meta: {
    title: 'Prana Yoga Studio Essen – Hatha Yoga in Essen-Borbeck',
    description:
      'Yoga-Kurse für jedes Alter und jede Fitness in Essen-Borbeck – bei Liudmyla Schiemann, mit über 20 Jahren Praxiserfahrung. Probestunde über WhatsApp anfragen.',
  },
  hero: {
    eyebrow: 'Hatha Yoga Studio in Essen-Borbeck',
    heading: { text: 'Ein gesunder Geist in einem', accent: 'gesunden Körper.' },
    lead: 'Yoga-Kurse für jedes Alter und jede Fitness – bei Liudmyla Schiemann, mit über 20 Jahren Praxiserfahrung.',
    image: 'homeHero' as CopyMediaKey,
  },
  courses: {
    eyebrow: 'Kurse',
    heading: { text: 'Unsere Yoga-Kurse –', accent: 'für jeden geeignet.' },
    intro:
      'Ganz egal, wie alt Sie sind oder welchen Beruf Sie haben. Auch Ihre momentane Fitness spielt keine Rolle.',
    allCourses: 'Alle Kurse ansehen',
    cardLink: 'Mehr erfahren',
  },
  newInStudio: {
    eyebrow: 'Neu im Studio',
    heading: { text: 'Zwei neue Kurse –', accent: 'mehr Kraft, mehr Balance.' },
    link: 'Zum Kurs',
    items: [
      {
        courseSlug: 'rad-yoga',
        badge: 'Neu',
        title: 'Rad Yoga',
        text: 'Kraft, Flexibilität und Balance mit dem Yoga-Rad – ideal für jedes Level.',
        image: 'newWheelYoga',
      },
      {
        courseSlug: 'yoga-sport-balance',
        badge: 'Neu',
        title: 'Yoga Sport Balance',
        text: 'Dynamische Bewegung, Krafttraining und Balance – für Anfänger und Fortgeschrittene.',
        image: 'newSportBalance',
      },
    ] as const satisfies readonly NewCourseTeaser[],
  },
  prana: {
    word: 'Prana',
    eyebrow: 'Warum Prana?',
    text: 'Prana bedeutet auf Sanskrit Lebensenergie – die Kraft, die das Fundament allen Lebens bildet: der Atem.',
  },
  reviews: {
    eyebrow: 'Stimmen',
    heading: 'Aus den Google-Bewertungen',
    allReviews: 'Alle Bewertungen auf Google',
    allReviewsAriaLabel: 'Alle Bewertungen auf Google (öffnet Google)',
  },
  trial: {
    eyebrow: 'Einstieg',
    /** "Probestunde für 15 €"; without a price the heading is just the block name. */
    priceJoiner: 'für',
    text: 'Eine Stunde in einem Kurs Ihrer Wahl.',
  },
} as const
