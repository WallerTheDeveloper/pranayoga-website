import type { AccentHeading } from './home'
import type { CopyMediaKey } from './mediaRefs'

const COUNT_WORDS = ['null', 'einem', 'zwei', 'drei', 'vier', 'fünf', 'sechs'] as const

/**
 * Fixed words of the teacher-training teaser (Komponenten.dc.html §07) and page
 * (Yogaausbildungen.dc.html). Dates, prices, deadlines, topics and requirements come from the
 * `teacher-training` global; each sentence below leaves its admin value out when it is missing.
 */
export const teacherTrainingCopy = {
  teaser: {
    label: 'Yogaausbildung',
    /** "Yogaausbildung · Start März 2027" */
    startPrefix: 'Start',
    button: 'Zur Yogaausbildung',
    /** Under the price when the admin left the price note empty. */
    priceTerm: 'Gesamtpreis',
  },
  page: {
    meta: {
      title: 'Yogaausbildung – 200 Stunden Yoga Teacher Training',
      description:
        'Yoga Teacher Training (200 Stunden) bei Liudmyla Schiemann in Essen-Borbeck: ein Wochenende pro Monat, zweisprachig auf Deutsch sowie Russisch oder Ukrainisch.',
    },
    breadcrumb: 'Yogaausbildungen',
    hero: {
      label: 'Yogaausbildung',
      startPrefix: 'Start',
      heading: { text: '200 Stunden', accent: 'Yoga Teacher Training' } satisfies AccentHeading,
      lead: 'Neun Monate, ein Wochenende pro Monat im Studio in Essen-Borbeck. Ob Sie schon Erfahrung mit Yoga haben oder ganz am Anfang stehen – Sie sind herzlich willkommen.',
      image: 'teacherTrainingHero' as CopyMediaKey,
      questionsPrompt: 'Fragen zur Ausbildung?',
    },
    whatsApp: {
      label: 'Fragen per WhatsApp',
      // Starts with the visible label, so voice control can use it (WCAG 2.5.3).
      ariaLabel: 'Fragen per WhatsApp an Liudmyla (öffnet WhatsApp)',
      hint: 'Ein direkter Chat mit Liudmyla – für alle Fragen zur Ausbildung.',
    },
    facts: {
      label: 'Die Ausbildung in Zahlen',
      hours: { value: '200', label: 'Stunden Theorie und Praxis' },
      weekends: { value: '9', label: 'Wochenenden vor Ort im Studio' },
      priceLabel: 'inklusive Arbeitsmaterial',
      languages: {
        value: 'DE · RU · UA',
        spoken: 'Deutsch, Russisch und Ukrainisch',
        label: 'zweisprachiger Unterricht',
      },
    },
    bilingual: {
      eyebrow: 'Besonders hilfreich',
      heading: 'Zweisprachiger Unterricht',
      text: 'Unterricht und Erklärungen finden auf Deutsch sowie auf Russisch oder Ukrainisch statt. Das macht die Ausbildung zugänglicher – besonders für alle, die sich beim Deutschsprechen noch nicht ganz sicher fühlen.',
      languagesLabel: 'Unterrichtssprachen',
      languages: ['Deutsch', 'Russisch', 'Ukrainisch'],
    },
    topics: {
      eyebrow: 'Inhalte',
      heading: 'Was Sie lernen',
      /** "200 Stunden Theorie und Praxis in drei Bereichen:" */
      intro: (count: number): string =>
        count === 1
          ? '200 Stunden Theorie und Praxis in einem Bereich:'
          : `200 Stunden Theorie und Praxis in ${COUNT_WORDS[count] ?? String(count)} Bereichen:`,
    },
    dates: {
      eyebrow: 'Termine',
      heading: 'Ihr Zeitinvestment',
      text: 'Neun Wochenenden vor Ort im Yogastudio. Bitte beachten Sie: Kleine Änderungen sind eventuell noch möglich.',
      start: 'Start',
      end: 'Abschluss',
      /** "3. Wochenende" */
      weekend: (position: number): string => `${position}. Wochenende`,
      listLabel: 'Ausbildungswochenenden',
      pending: 'Die genauen Termine geben wir bald bekannt.',
    },
    costs: {
      eyebrow: 'Investition',
      heading: 'Kosten',
      training: 'Ausbildung inkl. Arbeitsmaterial',
      deposit: 'Anzahlung',
      /** "500 €, fällig 14 Tage nach Anmeldung" */
      depositDue: (amount: string, deadline: string | null): string =>
        deadline ? `${amount}, fällig ${deadline} nach Anmeldung` : amount,
      balance: 'Restbetrag',
      balanceDue: (deadline: string): string => `spätestens ${deadline} nach der Anzahlung`,
      instalments: 'Ratenzahlung',
      instalmentsValue: 'nach Absprache möglich',
      membership: 'Mitgliedschaft während der Ausbildung',
    },
    requirements: {
      eyebrow: 'Voraussetzungen',
      heading: 'Während der Ausbildung',
      certificationEyebrow: 'Zertifizierung',
      teacher: 'Ihre Lehrerin: Liudmyla Schiemann, E-RYT 500 und YACEP (Yoga Alliance).',
    },
    signup: {
      eyebrow: 'Anmeldung',
      heading: 'So melden Sie sich an',
      contact: {
        title: 'Kontakt aufnehmen',
        text: 'Schreiben Sie Liudmyla direkt per WhatsApp, rufen Sie an oder senden Sie eine E-Mail – sie beantwortet Ihre Fragen.',
      },
      register: {
        title: 'Anmelden',
        // The deadline is stored as an accusative span ("14 Tage"), so it reads after "spätestens".
        text: (deposit: string | null, deadline: string | null): string => {
          if (!deposit)
            return 'Nach Ihrer Anmeldung leisten Sie eine Anzahlung – Liudmyla nennt Ihnen die Einzelheiten.'
          return deadline
            ? `Nach Ihrer Anmeldung ist die Anzahlung von ${deposit} fällig, spätestens ${deadline} danach.`
            : `Nach Ihrer Anmeldung ist die Anzahlung von ${deposit} fällig.`
        },
      },
      start: {
        title: 'Starten',
        text: (firstDay: string | null): string =>
          firstDay
            ? `Die Ausbildung beginnt am ersten Wochenende, am ${firstDay}.`
            : 'Die Ausbildung beginnt am ersten Wochenende.',
      },
    },
    flyer: {
      caption: 'Flyer zur Ausbildung',
      open: 'Flyer öffnen',
    },
  },
} as const
