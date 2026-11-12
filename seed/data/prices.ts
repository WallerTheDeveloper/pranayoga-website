import type { PriceGroup } from '../../src/payload-types'

/**
 * Price groups from Preise.dc.html. Prices stay empty: the studio has not confirmed them yet, so the
 * site hides every price line until the admin fills them in. Inclusions in [brackets] are hidden too.
 */

/** A block as in Payload, but linked to its course by slug: ids exist only after the course step. */
type SeedBlock = Omit<NonNullable<PriceGroup['blocks']>[number], 'id' | 'course'> & {
  courseSlug?: string
}

export interface SeedPriceGroup {
  kicker: string
  title: string
  description?: string
  blocks: SeedBlock[]
}

const block = (fields: Pick<SeedBlock, 'name' | 'action'> & Partial<SeedBlock>): SeedBlock => ({
  badge: 'none',
  price: null,
  highlighted: false,
  isTrial: false,
  showInSignupForm: false,
  ...fields,
})

const inclusions = (...texts: string[]): SeedBlock['inclusions'] => texts.map((text) => ({ text }))

const ANY_COURSE = 'Jeder Kurs nach Wunsch'

export const seedPriceGroups: SeedPriceGroup[] = [
  {
    kicker: 'Einstieg',
    title: 'Probestunde',
    description: 'Der erste Schritt: eine Stunde in einem Kurs Ihrer Wahl.',
    blocks: [
      block({
        name: 'Probestunde',
        unit: 'einmalig',
        inclusions: inclusions('Eine Stunde in einem Kurs Ihrer Wahl'),
        action: 'whatsapp',
        isTrial: true,
        highlighted: true,
      }),
    ],
  },
  {
    kicker: 'Mitgliedschaft',
    title: 'Regelmäßig üben',
    description: 'Monatlicher Beitrag, jeder Kurs nach Wunsch.',
    blocks: [
      block({
        name: '1× pro Woche',
        badge: 'popular',
        unit: 'pro Monat',
        inclusions: inclusions(ANY_COURSE, 'Mindestlaufzeit [Monate]'),
        action: 'signup',
        highlighted: true,
        showInSignupForm: true,
      }),
      block({
        name: '2× pro Woche',
        unit: 'pro Monat',
        inclusions: inclusions(ANY_COURSE, 'Mindestlaufzeit [Monate]'),
        action: 'signup',
        showInSignupForm: true,
      }),
      block({
        name: '3× pro Woche',
        badge: 'promo',
        unit: 'pro Monat',
        inclusions: inclusions(ANY_COURSE, 'Intensivtraining', 'Mindestlaufzeit [Monate]'),
        action: 'signup',
        showInSignupForm: true,
      }),
    ],
  },
  {
    kicker: 'Flexibel',
    title: '10er-Karte',
    description: 'Für alle, die flexibel bleiben möchten.',
    blocks: [
      block({
        name: '10er-Karte',
        unit: 'für 10 Stunden',
        inclusions: inclusions(ANY_COURSE, 'Gültig [Zeitraum]'),
        action: 'signup',
        showInSignupForm: true,
      }),
    ],
  },
  {
    kicker: 'Jugendliche',
    title: 'Jugend-Yoga',
    blocks: [
      block({
        name: 'Yoga für Jugendliche',
        unit: '[Einheit]',
        inclusions: inclusions('Für Jugendliche ab 14 Jahren'),
        action: 'signup',
        showInSignupForm: true,
        courseSlug: 'yoga-fuer-jugendliche',
      }),
    ],
  },
  {
    kicker: 'Privatstunden',
    title: 'Ganz für Sie allein',
    description: 'Einzelunterricht, Termin nach Absprache.',
    blocks: [
      block({
        name: 'Einzelstunde',
        unit: '60 Minuten',
        inclusions: inclusions('Privatunterricht', 'Termin nach Absprache'),
        action: 'whatsapp',
      }),
      block({
        name: '5er-Karte',
        unit: '5 × 60 Minuten',
        inclusions: inclusions('Privatunterricht', 'Termin nach Absprache'),
        action: 'whatsapp',
      }),
    ],
  },
]
