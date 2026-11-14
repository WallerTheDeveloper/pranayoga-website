import type { AccentHeading } from './home'

/** The 404 page (Fehler-404.dc.html) and the error pages, which share its layout. */
export const statusCopy = {
  linksLabel: 'Wege zurück',
  notFound: {
    meta: { title: 'Seite nicht gefunden' },
    eyebrow: 'Fehler 404',
    heading: { text: 'Diese Seite gibt es', accent: 'nicht (mehr).' } satisfies AccentHeading,
    lead: 'Vielleicht wurde sie verschoben. Einer dieser Wege führt Sie weiter:',
    mark: '404',
  },
  error: {
    eyebrow: 'Fehler',
    heading: { text: 'Etwas ist', accent: 'schiefgelaufen.' } satisfies AccentHeading,
    lead: 'Bitte laden Sie die Seite neu. Hilft das nicht, führt Sie einer dieser Wege weiter:',
    reload: 'Seite neu laden',
    mark: 'Prana',
  },
} as const
