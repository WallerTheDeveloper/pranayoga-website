/** Impressum and Datenschutzerklärung. The legal texts themselves are rich text in the admin. */
export const legalCopy = {
  updatedPrefix: 'Stand:',
  /** While the admin text is empty. */
  pending:
    'Dieser Text wird gerade überarbeitet. Bei Fragen erreichen Sie uns per Telefon oder E-Mail.',
  legalNotice: {
    meta: {
      title: 'Impressum',
      description: 'Impressum des Prana Yoga Studio Essen – Liudmyla Schiemann, Essen-Borbeck.',
    },
    breadcrumb: 'Impressum',
    heading: 'Impressum',
    card: {
      label: 'Anbieterin',
      studio: 'Prana Yoga Studio Essen',
      owner: 'Liudmyla Schiemann',
      phonePrefix: 'Telefon:',
      emailPrefix: 'E-Mail:',
    },
  },
  privacyPolicy: {
    meta: {
      title: 'Datenschutzerklärung',
      description: 'Datenschutzerklärung des Prana Yoga Studio Essen.',
    },
    breadcrumb: 'Datenschutzerklärung',
    // A soft hyphen: the long word breaks cleanly on narrow phones.
    heading: 'Datenschutz­erklärung',
  },
} as const
