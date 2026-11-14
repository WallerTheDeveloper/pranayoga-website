/** Words every form shares: the error summary, the sending state and the no-JavaScript note. */
export const formsCopy = {
  optional: '(optional)',
  /** "Bitte prüfen Sie 2 Felder." (Komponenten.dc.html, forms §03) */
  errorSummary: (count: number): string =>
    count === 1 ? 'Bitte prüfen Sie 1 Feld.' : `Bitte prüfen Sie ${count} Felder.`,
  sending: 'Wird gesendet …',
  noScript:
    'Für dieses Formular wird JavaScript benötigt. Sie erreichen uns genauso per WhatsApp, Telefon oder E-Mail.',
  emailMissing: 'Bitte geben Sie Ihre E-Mail-Adresse ein.',
  emailInvalid: 'Bitte geben Sie eine gültige E-Mail-Adresse ein, zum Beispiel name@beispiel.de.',
  phoneInvalid: 'Bitte geben Sie eine gültige Telefonnummer ein, zum Beispiel 0201 123456.',
  tooLong: (max: number): string => `Bitte kürzen Sie Ihre Eingabe auf höchstens ${max} Zeichen.`,
  submitFailed:
    'Das Senden hat nicht geklappt. Bitte versuchen Sie es noch einmal oder schreiben Sie uns per WhatsApp oder E-Mail.',
} as const
