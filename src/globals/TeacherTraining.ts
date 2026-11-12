import type { GlobalConfig } from 'payload'

import { isLoggedIn, publishedOrLoggedIn } from '@/access'
import { globalCacheHooks } from '@/cache/hooks'
import { CACHE_TAGS } from '@/cache/tags'
import { ADMIN_GROUPS, label } from '@/fields/labels'
import { validatePrice } from '@/fields/validators'

/**
 * The teacher training ("Yogaausbildung"). Phase 2 holds what the shared teaser needs (start month,
 * price, text and key facts); the teacher-training page adds its own fields in phase 3. The
 * teaser's start month and price read the same fields as that page (Komponenten.dc.html §07).
 */
export const TeacherTraining: GlobalConfig = {
  slug: 'teacher-training',
  label: label('Yogaausbildung', 'Teacher training'),
  admin: {
    group: ADMIN_GROUPS.content,
    description: label(
      'Start, Preis und der Hinweis-Block auf den Kursseiten und der Kursübersicht.',
      'Start, price and the teaser block on the course pages and the course overview.',
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
            date: { pickerAppearance: 'monthOnly', displayFormat: 'MMMM yyyy' },
            description: label(
              'Leer = der Start wird nicht genannt.',
              'Empty = the start is not mentioned.',
            ),
          },
        },
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
