import type { GlobalConfig } from 'payload'

import { isLoggedIn, publishedOrLoggedIn } from '@/access'
import { globalCacheHooks } from '@/cache/hooks'
import { CACHE_TAGS } from '@/cache/tags'
import { imageField } from '@/fields/builders'
import { ADMIN_GROUPS, label } from '@/fields/labels'
import { validatePrice } from '@/fields/validators'

const monthPicker = {
  date: { pickerAppearance: 'monthOnly', displayFormat: 'MMMM yyyy' },
} as const

const dayPicker = {
  date: { pickerAppearance: 'dayOnly', displayFormat: 'dd.MM.yyyy' },
} as const

/** A duration as it reads after "fällig" / "spätestens": "14 Tage", "4 Wochen". */
const deadlineDescription = label(
  'Als Zeitraum, z. B. „14 Tage“ oder „4 Wochen“. Leer = wird nicht genannt.',
  'As a duration, e.g. "14 Tage" or "4 Wochen". Empty = not mentioned.',
)

/**
 * The teacher training ("Yogaausbildung"): the page's dates, prices, deadlines, topics and
 * requirements, plus the shared teaser on the course pages, Kurse and Preise. The teaser's start
 * month and price read the same fields as the page (Komponenten.dc.html §07 and §09).
 */
export const TeacherTraining: GlobalConfig = {
  slug: 'teacher-training',
  label: label('Yogaausbildung', 'Teacher training'),
  admin: {
    group: ADMIN_GROUPS.content,
    description: label(
      'Termine, Preise, Inhalte und Voraussetzungen der Yogaausbildung, dazu der Hinweis-Block auf den Kursseiten. Leere Felder werden auf der Website ausgeblendet.',
      'Dates, prices, topics and requirements of the teacher training, plus the teaser block on the course pages. Empty fields are hidden on the site.',
    ),
  },
  access: {
    read: publishedOrLoggedIn,
    update: isLoggedIn,
    readVersions: isLoggedIn,
  },
  versions: {
    max: 25,
    drafts: { autosave: { interval: 800 }, schedulePublish: false },
  },
  hooks: globalCacheHooks({ drafts: true, tags: [CACHE_TAGS.teacherTraining] }),
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'startMonth',
          type: 'date',
          label: label('Start (Monat)', 'Start (month)'),
          admin: {
            ...monthPicker,
            description: label(
              'Leer = der Start wird nicht genannt.',
              'Empty = the start is not mentioned.',
            ),
          },
        },
        {
          name: 'endMonth',
          type: 'date',
          label: label('Abschluss (Monat)', 'End (month)'),
          admin: {
            ...monthPicker,
            description: label(
              'Leer = der Abschluss wird nicht genannt.',
              'Empty = the end is not mentioned.',
            ),
          },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'price',
          type: 'number',
          label: label('Preis in Euro', 'Price in euros'),
          min: 0,
          validate: validatePrice,
          admin: {
            step: 1,
            description: label(
              'Leer = noch nicht festgelegt; die Preiszeile wird ausgeblendet.',
              'Empty = not set yet; the price line is hidden.',
            ),
          },
        },
        {
          name: 'deposit',
          type: 'number',
          label: label('Anzahlung in Euro', 'Deposit in euros'),
          min: 0,
          validate: validatePrice,
          admin: {
            step: 1,
            description: label(
              'Leer = die Anzahlung wird nicht genannt.',
              'Empty = the deposit is not mentioned.',
            ),
          },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'depositDeadline',
          type: 'text',
          label: label('Anzahlung fällig nach Anmeldung', 'Deposit due after signing up'),
          maxLength: 24,
          admin: { description: deadlineDescription },
        },
        {
          name: 'balanceDeadline',
          type: 'text',
          label: label('Restbetrag spätestens nach Anzahlung', 'Balance due after the deposit'),
          maxLength: 24,
          admin: { description: deadlineDescription },
        },
      ],
    },
    {
      name: 'membershipDiscount',
      type: 'text',
      label: label('Mitgliedschaft während der Ausbildung', 'Membership during the training'),
      maxLength: 40,
      admin: {
        description: label(
          'z. B. „20 % Rabatt“. Leer = die Zeile wird ausgeblendet.',
          'e.g. "20 % Rabatt". Empty = the line is hidden.',
        ),
      },
    },
    {
      name: 'weekends',
      type: 'array',
      label: label('Ausbildungswochenenden', 'Training weekends'),
      labels: {
        singular: label('Wochenende', 'Weekend'),
        plural: label('Wochenenden', 'Weekends'),
      },
      maxRows: 12,
      admin: {
        description: label(
          'In zeitlicher Reihenfolge. Das erste Wochenende ist der Starttermin.',
          'In date order. The first weekend is the start date.',
        ),
      },
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'from',
              type: 'date',
              label: label('Erster Tag', 'First day'),
              required: true,
              admin: dayPicker,
            },
            {
              name: 'to',
              type: 'date',
              label: label('Letzter Tag (optional)', 'Last day (optional)'),
              admin: dayPicker,
            },
          ],
        },
      ],
    },
    {
      name: 'topics',
      type: 'array',
      label: label('Inhalte („Was Sie lernen“)', 'Topics ("Was Sie lernen")'),
      labels: { singular: label('Bereich', 'Topic'), plural: label('Bereiche', 'Topics') },
      maxRows: 6,
      fields: [
        {
          name: 'title',
          type: 'text',
          label: label('Titel', 'Title'),
          required: true,
          maxLength: 60,
        },
        {
          name: 'text',
          type: 'textarea',
          label: label('Beschreibung', 'Description'),
          maxLength: 240,
        },
      ],
    },
    {
      name: 'requirements',
      type: 'array',
      label: label('Voraussetzungen („Während der Ausbildung“)', 'Requirements'),
      labels: {
        singular: label('Voraussetzung', 'Requirement'),
        plural: label('Voraussetzungen', 'Requirements'),
      },
      maxRows: 8,
      admin: {
        description: label(
          'Zeilen mit [eckigen Klammern] gelten als noch offen und erscheinen nicht auf der Website.',
          'Lines with [square brackets] count as not filled in and are hidden on the site.',
        ),
      },
      fields: [
        {
          name: 'text',
          type: 'text',
          label: label('Text', 'Text'),
          required: true,
          maxLength: 120,
        },
      ],
    },
    {
      name: 'certification',
      type: 'textarea',
      label: label('Abschluss und Zertifizierung', 'Certification'),
      maxLength: 300,
      admin: {
        description: label(
          'Leer oder mit [eckigen Klammern] = der Kasten „Zertifizierung“ wird ausgeblendet.',
          'Empty or with [square brackets] = the "Zertifizierung" box is hidden.',
        ),
      },
    },
    {
      name: 'flyer',
      type: 'group',
      label: label('Flyer', 'Flyer'),
      admin: {
        description: label(
          '„Flyer öffnen“ führt zur PDF unter Downloads (Verwendung „Flyer“), sonst zum Bild in voller Größe.',
          '"Flyer öffnen" opens the PDF in Downloads (usage "Flyer"), or else the full-size image.',
        ),
      },
      fields: [
        imageField({ name: 'image', label: label('Bild des Flyers', 'Flyer image'), tier: 'card' }),
      ],
    },
    {
      name: 'teaser',
      type: 'group',
      label: label('Hinweis-Block', 'Teaser block'),
      admin: {
        description: label(
          'Grüner Block mit Knopf „Zur Yogaausbildung“ auf jeder Kursseite und der Kursübersicht.',
          'Green block with the "Zur Yogaausbildung" button on every course page and the overview.',
        ),
      },
      fields: [
        {
          name: 'heading',
          type: 'text',
          label: label('Überschrift', 'Heading'),
          required: true,
          maxLength: 70,
        },
        {
          name: 'text',
          type: 'textarea',
          label: label('Text', 'Text'),
          maxLength: 220,
        },
        {
          name: 'facts',
          type: 'array',
          label: label('Eckdaten', 'Key facts'),
          labels: { singular: label('Eckdatum', 'Fact'), plural: label('Eckdaten', 'Facts') },
          maxRows: 3,
          admin: {
            description: label(
              'Bis zu drei Zeilen neben dem Text. Der Preis folgt automatisch als letzte Zeile.',
              'Up to three lines next to the text. The price follows as the last line.',
            ),
          },
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'value',
                  type: 'text',
                  label: label('Wert', 'Value'),
                  required: true,
                  maxLength: 24,
                  admin: { description: label('z. B. „200 Stunden“', 'e.g. "200 Stunden"') },
                },
                {
                  name: 'label',
                  type: 'text',
                  label: label('Erläuterung', 'Explanation'),
                  required: true,
                  maxLength: 60,
                  admin: {
                    description: label('z. B. „Theorie und Praxis“', 'e.g. "Theorie und Praxis"'),
                  },
                },
              ],
            },
          ],
        },
        {
          name: 'priceNote',
          type: 'text',
          label: label('Hinweis unter dem Preis', 'Note under the price'),
          maxLength: 60,
          admin: {
            description: label(
              'z. B. „inkl. Arbeitsmaterial, Ratenzahlung nach Absprache“',
              'e.g. "inkl. Arbeitsmaterial, Ratenzahlung nach Absprache"',
            ),
          },
        },
      ],
    },
  ],
}
