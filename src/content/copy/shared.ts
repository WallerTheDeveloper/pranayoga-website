/**
 * Site-wide copy from the design (Startseite.dc.html shell). German text only; promoting any of it
 * to the admin later means adding a Payload field and changing src/content/copy.ts.
 */
export const sharedCopy = {
  brand: {
    name: 'Prana Yoga Studio Essen',
    logoAlt: 'Prana Yoga Studio Essen – zur Startseite',
    footerLogoAlt: 'Prana Yoga Studio Essen',
  },
  skipLink: 'Zum Inhalt springen',
  whatsApp: {
    bookLabel: 'Termin über WhatsApp',
    /** Spoken by screen readers: the link leaves the site. */
    bookAriaLabel: 'Termin über WhatsApp (öffnet WhatsApp)',
    personalLabel: 'Persönlich schreiben',
    // Starts with the visible label, so voice control can use it (WCAG 2.5.3).
    personalAriaLabel: 'Persönlich schreiben (öffnet WhatsApp)',
    hint: 'In unserer WhatsApp-Gruppe finden Sie alle aktuellen Kurszeiten und können Ihren Platz anfragen.',
    personalPrompt: 'Lieber persönlich?',
    emailChip: 'E-Mail schreiben',
  },
  contactBar: {
    callPrefix: 'Rufen Sie uns an:',
  },
  social: {
    instagram: 'Instagram',
    instagramAriaLabel: 'Prana Yoga auf Instagram (öffnet Instagram)',
    facebook: 'Facebook',
    facebookAriaLabel: 'Prana Yoga auf Facebook (öffnet Facebook)',
  },
  nav: {
    mainLabel: 'Hauptmenü',
    mobileLabel: 'Hauptmenü mobil',
    courses: 'Kurse',
    allCoursesLabel: 'Alle Kurse',
    pricing: 'Mitgliedschaft & Preise',
    about: 'Über uns',
    contact: 'Kontakt',
    teacherTraining: 'Yogaausbildungen',
    menu: 'Menü',
    menuDialogLabel: 'Menü',
    closeMenu: 'Menü schließen',
    dropdownHint: 'Kurszeiten und freie Plätze in der WhatsApp-Gruppe',
    dropdownAllCourses: 'Alle Kurse im Überblick',
  },
  mobileBar: {
    label: 'Kontakt',
    book: 'Termin über WhatsApp',
    call: 'Anrufen',
    callAriaPrefix: 'Anrufen:',
    email: 'E-Mail',
    emailAriaPrefix: 'E-Mail an',
  },
  footer: {
    contactHeading: 'Kontakt',
    whatsAppGroup: 'WhatsApp-Gruppe',
    whatsAppGroupAriaLabel: 'WhatsApp-Gruppe (öffnet WhatsApp)',
    coursesHeading: 'Kurse',
    studioHeading: 'Studio',
    signup: 'Anmeldeformular',
    legalNotice: 'Impressum',
    privacyPolicy: 'Datenschutzerklärung',
    /** Year is filled in at render time. */
    copyright: (year: number) =>
      `© ${year} Prana Yoga Studio Essen · Yoga Alliance E-RYT 200 · E-RYT 500 · YACEP`,
  },
  breadcrumbs: {
    label: 'Sie sind hier',
    home: 'Startseite',
  },
} as const
