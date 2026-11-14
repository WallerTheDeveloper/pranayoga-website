import type { LegalNotice } from '../../src/payload-types'

type RichText = NonNullable<LegalNotice['content']>
type Node = RichText['root']['children'][number]

const PLACEHOLDER_TEXT =
  '[Rechtstext – wird im Admin-Bereich eingefügt. Fließtext 18 px, Zeilenlänge max. 72 Zeichen.]'

function text(value: string) {
  return { type: 'text', text: value, format: 0, detail: 0, mode: 'normal', style: '', version: 1 }
}

function heading(value: string): Node {
  return {
    type: 'heading',
    tag: 'h2',
    format: '',
    indent: 0,
    version: 1,
    direction: 'ltr',
    children: [text(value)],
  }
}

function paragraph(value: string): Node {
  return {
    type: 'paragraph',
    format: '',
    indent: 0,
    version: 1,
    direction: 'ltr',
    textFormat: 0,
    textStyle: '',
    children: [text(value)],
  }
}

/** The design's section titles, each with a placeholder paragraph (Impressum/Datenschutz.dc.html). */
function placeholderText(sections: readonly string[]): RichText {
  return {
    root: {
      type: 'root',
      format: '',
      indent: 0,
      version: 1,
      direction: 'ltr',
      children: sections.flatMap((section) => [
        heading(`[${section}]`),
        paragraph(PLACEHOLDER_TEXT),
      ]),
    },
  }
}

/**
 * The legal texts come from the client's legal advisor. Until then the admin shows the design's
 * outline in brackets, and the site hides every bracketed block (it shows a short note instead).
 */
export const seedLegalNotice = placeholderText([
  'Angaben gemäß gesetzlicher Vorgaben',
  'Verantwortlich für den Inhalt',
  'Streitschlichtung',
  'Haftung für Inhalte und Links',
  'Urheberrecht',
])

export const seedPrivacyPolicy = placeholderText([
  '1. Verantwortliche Stelle',
  '2. Erhebung und Speicherung personenbezogener Daten',
  '3. Kontakt- und Anmeldeformular',
  '4. WhatsApp-Gruppe',
  '5. Cookies',
  '6. Karte',
  '7. Ihre Rechte',
])
