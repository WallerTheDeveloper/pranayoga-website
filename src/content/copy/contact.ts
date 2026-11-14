import type { CopyMediaKey } from './mediaRefs'

/** Kontakt (Kontakt.dc.html). Phone, email, address and the map URL come from the admin. */
export const contactCopy = {
  meta: {
    title: 'Kontakt',
    description:
      'So erreichen Sie das Prana Yoga Studio in Essen-Borbeck: WhatsApp-Gruppe, Telefon, E-Mail, Kontaktformular und Anfahrt.',
  },
  breadcrumb: 'Kontakt',
  heading: 'Kontakt',
  lead: 'Am schnellsten erreichen Sie uns in der WhatsApp-Gruppe. Telefon und E-Mail sind natürlich genauso willkommen.',
  image: 'contactHero' as CopyMediaKey,
  whatsAppEyebrow: 'WhatsApp-Gruppe',
  details: {
    label: 'Kontaktdaten',
    phone: 'Telefon',
    email: 'E-Mail',
    address: 'Adresse',
  },
  socialLabel: 'Soziale Netzwerke',
  form: {
    title: 'Schreiben Sie uns jetzt eine Nachricht!',
    name: 'Name',
    email: 'E-Mail',
    phone: 'Telefon',
    subject: 'Betreff',
    message: 'Nachricht',
    privacyBefore: 'Wir verwenden Ihre Angaben nur, um Ihre Anfrage zu beantworten. Mehr in der',
    privacyLink: 'Datenschutzerklärung',
    privacyAfter: '.',
    submit: 'Nachricht senden',
    success: {
      heading: 'Vielen Dank für Ihre Nachricht!',
      text: 'Wir melden uns so bald wie möglich bei Ihnen.',
    },
    errors: {
      name: 'Bitte geben Sie Ihren Namen ein.',
      message: 'Bitte schreiben Sie uns eine Nachricht.',
    },
  },
  map: {
    heading: 'Anfahrt',
    notice: 'Beim Laden der Karte werden Daten an Google übertragen.',
    privacyLink: 'Mehr dazu in der Datenschutzerklärung',
    load: 'Karte laden',
    route: 'Route planen',
    routeAriaLabel: 'Route planen (öffnet Google Maps)',
    /** The iframe's accessible name. */
    frameTitle: (address: string): string => `Karte: Prana Yoga Studio, ${address}`,
  },
} as const
