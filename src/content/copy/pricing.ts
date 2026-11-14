import type { PriceBadge } from '../types'
import type { AccentHeading } from './home'
import type { CopyMediaKey } from './mediaRefs'

const WAY_COUNT_WORDS = ['Kein', 'Ein', 'Zwei', 'Drei'] as const

/** Mitgliedschaft & Preise (Mitgliedschaft-Preise.dc.html). Prices and bank data come from the admin. */
export const pricingCopy = {
  meta: {
    title: 'Mitgliedschaft & Preise',
    description:
      'Probestunde, Mitgliedschaft, 10er-Karte, Jugend-Yoga und Privatstunden im Prana Yoga Studio Essen – mit Online-Anmeldung, Vertrag zum Herunterladen und Bankverbindung.',
  },
  breadcrumb: 'Mitgliedschaft & Preise',
  hero: {
    heading: { text: 'Mitgliedschaft', accent: '& Preise' } satisfies AccentHeading,
    lead: 'Das Beste, was Sie für sich tun können: Ihre Wirbelsäule rechtzeitig stärken. Investieren Sie in Ihre Gesundheit.',
    image: 'pricingHero' as CopyMediaKey,
  },
  card: {
    badges: { popular: 'Beliebt', promo: 'Aktion' } satisfies Record<PriceBadge, string>,
    /** In place of the amount while the studio has not set a price. */
    priceOnRequest: 'Preis auf Anfrage',
    inclusionsLabel: 'Enthalten',
    signup: 'Online anmelden',
    /** Accessible name: "Online anmelden: 1× pro Woche". */
    signupAriaLabel: (name: string): string => `Online anmelden: ${name}`,
  },
  teacherTrainingLabel: 'Yogaausbildung',
  signupWays: {
    eyebrow: 'Anmelden',
    heading: 'So melden Sie sich an',
    /** "Drei Wege – wählen Sie den, der für Sie am einfachsten ist." */
    intro: (count: number): string =>
      count <= 1
        ? 'Füllen Sie das Formular aus und senden Sie es ab – wir melden uns bei Ihnen.'
        : `${WAY_COUNT_WORDS[count] ?? String(count)} Wege – wählen Sie den, der für Sie am einfachsten ist.`,
    online: {
      title: 'Online anmelden',
      text: 'Formular ausfüllen und absenden – wir melden uns bei Ihnen.',
      button: 'Online anmelden',
    },
    contract: {
      title: 'Vertrag herunterladen',
      text: 'Ausdrucken, unterschreiben und im Studio abgeben.',
      button: 'Vertrag herunterladen (PDF)',
    },
    transfer: {
      title: 'Per Überweisung',
    },
  },
  bank: {
    bankName: 'Bank',
    accountHolder: 'Kontoinhaber',
    iban: 'IBAN',
    paymentReference: 'Verwendungszweck',
    copy: 'IBAN kopieren',
    copied: 'Kopiert',
    copiedStatus: 'Die IBAN wurde in die Zwischenablage kopiert.',
    copyFailed:
      'Kopieren hat nicht geklappt. Bitte markieren Sie die IBAN und kopieren Sie sie selbst.',
  },
} as const
