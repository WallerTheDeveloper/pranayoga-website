import type { TeacherTraining } from '../../src/payload-types'

/**
 * The teacher-training teaser from Kurse.dc.html and Komponenten.dc.html §07. Start month and price
 * are "[Monat Jahr]" and "[Preis]" in the design: the studio has not fixed them yet, so both stay
 * empty and the site leaves them out until the admin fills them in.
 */
export const seedTeacherTraining: Omit<
  TeacherTraining,
  'id' | '_status' | 'updatedAt' | 'createdAt'
> = {
  startMonth: null,
  price: null,
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
