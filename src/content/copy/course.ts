/**
 * Fixed labels of the course page template (Kurs-*.dc.html). Everything course-specific (title,
 * lead, audience, steps, benefits, schedule, FAQ) is admin data on the course itself.
 */
export const courseCopy = {
  hero: {
    /** "Für: Jugendliche ab 14" */
    audienceTerm: 'Für',
    hint: 'Aktuelle Kurszeiten und freie Plätze erfahren Sie in unserer WhatsApp-Gruppe.',
    allPrices: 'Alle Preise',
  },
  audience: {
    eyebrow: 'Für wen',
    /** Used when the admin heading is empty. */
    heading: 'Für wen ist der Kurs?',
    medicalNote: 'Bei medizinischen Bedenken befragen Sie bitte vorab Ihren Arzt.',
  },
  steps: { eyebrow: 'In der Stunde' },
  benefits: { eyebrow: 'Wirkung' },
  trial: {
    eyebrow: 'Kurszeiten & Probestunde',
    priceJoiner: 'für',
    text: 'Eine Stunde in einem Kurs Ihrer Wahl.',
    hint: 'Aktuelle Änderungen und freie Plätze erfahren Sie in unserer WhatsApp-Gruppe.',
  },
  schedule: { heading: 'Kurszeiten' },
  bringAlong: { eyebrow: 'Mitbringen', heading: 'Was Sie mitbringen' },
  faq: { eyebrow: 'Fragen', heading: 'Häufige Fragen' },
  related: {
    heading: 'Weitere Kurse',
    allCourses: 'Alle Kurse',
    cardLink: 'Mehr erfahren',
  },
} as const
