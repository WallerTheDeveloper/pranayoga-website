import type { TeacherTraining } from '../../src/payload-types'

/** The flyer image on the Yogaausbildungen page (seed/images, listed in the manifest). */
export const SEED_FLYER_IMAGE = 'teacher-training-flyer.png'

/**
 * The teacher training from Yogaausbildungen.dc.html and the teaser in Komponenten.dc.html §07.
 * Dates, prices, deadlines and the discount are "[…]" in the design: the studio has not fixed
 * them yet, so they stay empty and the site leaves them out until the admin fills them in. Texts
 * the client still has to confirm keep their brackets, which hides them on the site.
 */
export const seedTeacherTraining: Omit<
  TeacherTraining,
  'id' | '_status' | 'updatedAt' | 'createdAt' | 'flyer'
> = {
  startMonth: null,
  endMonth: null,
  price: null,
  deposit: null,
  depositDeadline: null,
  balanceDeadline: null,
  membershipDiscount: null,
  weekends: [],
  topics: [
    {
      title: 'Unterrichtsmethodik & Didaktik',
      text: 'Wie Sie eine Yogastunde aufbauen, anleiten und Teilnehmende sicher begleiten.',
    },
    {
      title: 'Technik & Anatomie',
      text: 'Die Asanas, ihre korrekte Ausführung und der Körper dahinter.',
    },
    {
      title: 'Philosophie & Ethik',
      text: 'Die Wurzeln des Yoga und die Haltung als Lehrerin oder Lehrer.',
    },
  ],
  requirements: [
    { text: '100 % Teilnahme an allen Ausbildungsterminen' },
    { text: '100 % Teilnahme an allen Masterclasses und Retreats' },
    { text: 'Tägliche eigene Yoga- und Meditationspraxis zu Hause' },
    { text: 'Teilnahme an mindestens [2 oder 3] Yogakursen pro Woche' },
  ],
  certification:
    '[Abschluss und Zertifizierung, z. B. Registrierung bei Yoga Alliance – bitte bestätigen]',
  teaser: {
    heading: 'Werden Sie selbst Yogalehrerin oder Yogalehrer.',
    text: 'Lernen Sie bei Liudmyla Schiemann (E-RYT 500, YACEP), selbst Yoga zu unterrichten – ob mit viel Erfahrung oder ganz am Anfang.',
    facts: [
      { value: '200 Stunden', label: 'Theorie und Praxis' },
      { value: '9 Wochenenden', label: 'ein Wochenende pro Monat im Studio' },
      { value: 'Zweisprachig', label: 'Deutsch sowie Russisch oder Ukrainisch' },
    ],
    priceNote: 'inkl. Arbeitsmaterial, Ratenzahlung nach Absprache',
  },
}
