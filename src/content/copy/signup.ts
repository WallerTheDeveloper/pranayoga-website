/**
 * Anmeldeformular (Anmeldeformular.dc.html). The form is UI only until launch: it validates and
 * shows the success state, but sends nothing yet (docs/PLAN.md "Forms").
 */
export const signupCopy = {
  meta: {
    title: 'Anmeldeformular',
    description:
      'Melden Sie sich online für Ihr Yoga-Abonnement im Prana Yoga Studio Essen an – Mitgliedschaft, 10er-Karte oder Jugend-Yoga.',
  },
  breadcrumb: 'Anmeldeformular',
  heading: 'Anmeldeformular',
  lead: 'Hiermit melden Sie sich verbindlich für ein Yoga-Abonnement an. Pflichtfelder sind alle Felder ohne den Zusatz „optional“.',
  personal: {
    legend: '1. Ihre Angaben',
    name: 'Vor- und Nachname',
    birthDate: 'Geburtsdatum',
    street: 'Straße und Hausnummer',
    postalCode: 'Postleitzahl',
    city: 'Ort',
    phone: 'Telefonnummer',
    email: 'E-Mail',
  },
  subscription: {
    legend: '2. Ihr Abonnement',
    plan: 'Yoga-Abonnement',
    planPlaceholder: 'Bitte wählen',
    noPlans:
      'Die Abonnements werden gerade aktualisiert. Bitte melden Sie sich so lange per WhatsApp, Telefon oder E-Mail an.',
    startDate: 'Beginn ab',
    startDateHint: 'Ab wann möchten Sie üben?',
  },
  payment: {
    legend: '3. Zahlung',
    question: 'Wie möchten Sie bezahlen?',
    directDebit: 'Einzugsermächtigung',
    transfer: 'Überweisung',
    accountHolder: 'Kontoinhaber/in',
    bankName: 'Kreditinstitut',
    iban: 'IBAN',
    ibanHint: 'Beginnt mit DE, 22 Zeichen.',
    transferTo: 'Bitte überweisen Sie an:',
    transferIban: 'IBAN',
  },
  consent: {
    text: 'Ich erkläre mich damit einverstanden, dass meine Daten gemäß der DSGVO von Prana Yoga verarbeitet werden.',
    link: 'Datenschutzerklärung',
    binding: 'Mit dem Absenden melden Sie sich verbindlich an.',
  },
  submit: 'Anmeldung senden',
  success: {
    heading: 'Vielen Dank für Ihre Anmeldung!',
    text: 'Wir melden uns so bald wie möglich bei Ihnen.',
  },
  aside: {
    eyebrow: 'Gut zu wissen',
    title: 'Noch unsicher, welches Abo passt?',
    text: 'Alle Angebote im Überblick finden Sie unter Mitgliedschaft & Preise.',
    link: 'Zu den Preisen',
    prompt: 'Lieber direkt fragen?',
  },
  errors: {
    name: 'Bitte geben Sie Ihren Vor- und Nachnamen ein.',
    birthDate: 'Bitte geben Sie Ihr Geburtsdatum ein.',
    birthDateInvalid: 'Bitte geben Sie ein gültiges Geburtsdatum ein.',
    street: 'Bitte geben Sie Straße und Hausnummer ein.',
    postalCode: 'Bitte geben Sie Ihre Postleitzahl ein.',
    postalCodeInvalid: 'Die Postleitzahl hat fünf Ziffern, zum Beispiel 45356.',
    city: 'Bitte geben Sie Ihren Ort ein.',
    phone: 'Bitte geben Sie Ihre Telefonnummer ein.',
    plan: 'Bitte wählen Sie ein Yoga-Abonnement.',
    startDate: 'Bitte wählen Sie, ab wann Sie üben möchten.',
    startDateInvalid: 'Bitte wählen Sie ein gültiges Datum.',
    startDatePast: 'Der Beginn darf nicht in der Vergangenheit liegen.',
    accountHolder: 'Bitte geben Sie den Namen der Kontoinhaberin oder des Kontoinhabers ein.',
    bankName: 'Bitte geben Sie Ihr Kreditinstitut ein.',
    iban: 'Bitte geben Sie Ihre IBAN ein.',
    ibanFormat: 'Bitte geben Sie die vollständige IBAN ein: in Deutschland DE und 20 Ziffern.',
    ibanChecksum: 'Diese IBAN ist nicht gültig. Bitte prüfen Sie die Eingabe.',
    consent: 'Bitte stimmen Sie der Verarbeitung Ihrer Daten zu.',
  },
} as const
