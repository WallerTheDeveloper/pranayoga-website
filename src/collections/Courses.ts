import type { CollectionConfig, TextFieldValidation } from 'payload'

import { isLoggedIn, publishedOrLoggedIn } from '@/access'
import { collectionCacheHooks } from '@/cache/hooks'
import { CACHE_TAGS, courseTag } from '@/cache/tags'
import { COURSE_ICON_LABELS, COURSE_ICON_NAMES } from '@/components/icons/courseIconNames'
import { imageField, orderField, seoGroup, slugField } from '@/fields/builders'
import { ADMIN_GROUPS, label } from '@/fields/labels'
import { validateTime } from '@/fields/validators'
import { WEEKDAYS, WEEKDAY_LABELS } from '@/lib/format'
import { compareTimes, isValidTime } from '@/lib/validation/time'
import type { Course } from '@/payload-types'

/** A slug change clears both tags: the hook passes the old and the new document. */
const courseTags = (doc: Pick<Course, 'slug'>): string[] =>
  doc.slug ? [CACHE_TAGS.courses, courseTag(doc.slug)] : [CACHE_TAGS.courses]

const validateEndAfterStart: TextFieldValidation = async (value, options) => {
  const base = await validateTime(value, options)
  if (base !== true || !value) return base
  const start = (options.siblingData as { start?: unknown } | undefined)?.start
  if (typeof start === 'string' && isValidTime(start) && compareTimes(String(value), start) <= 0) {
    return 'Das Ende muss nach dem Beginn liegen.'
  }
  return true
}

const WEEKDAY_LABELS_EN: Readonly<Record<(typeof WEEKDAYS)[number], string>> = {
  monday: 'Monday',
  tuesday: 'Tuesday',
  wednesday: 'Wednesday',
  thursday: 'Thursday',
  friday: 'Friday',
  saturday: 'Saturday',
  sunday: 'Sunday',
}

export const Courses: CollectionConfig = {
  slug: 'courses',
  labels: {
    singular: label('Kurs', 'Course'),
    plural: label('Kurse', 'Courses'),
  },
  admin: {
    group: ADMIN_GROUPS.content,
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'order', '_status', 'updatedAt'],
  },
  defaultSort: 'order',
  access: {
    read: publishedOrLoggedIn,
    create: isLoggedIn,
    update: isLoggedIn,
    delete: isLoggedIn,
    readVersions: isLoggedIn,
  },
  versions: {
    maxPerDoc: 25,
    drafts: { autosave: { interval: 800 }, schedulePublish: false },
  },
  hooks: collectionCacheHooks<Course>({ drafts: true, tags: courseTags }),
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: label('Übersicht', 'Overview'),
          fields: [
            {
              name: 'title',
              type: 'text',
              label: label('Kursname', 'Course name'),
              required: true,
              maxLength: 40,
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'icon',
                  type: 'select',
                  label: label('Symbol', 'Icon'),
                  required: true,
                  options: COURSE_ICON_NAMES.map((value) => ({
                    value,
                    label: COURSE_ICON_LABELS[value],
                  })),
                },
                {
                  name: 'tagline',
                  type: 'text',
                  label: label('Kurzbeschreibung (Menü)', 'Tagline (menu)'),
                  required: true,
                  maxLength: 40,
                },
              ],
            },
            {
              name: 'badge',
              type: 'group',
              label: label('Etikett', 'Badge'),
              admin: {
                description: label(
                  'Optional, z. B. „Neu“ oder „50 Plus“. Leer = kein Etikett.',
                  'Optional, e.g. "Neu" or "50 Plus". Empty = no badge.',
                ),
              },
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'text', type: 'text', label: label('Text', 'Text'), maxLength: 16 },
                    {
                      name: 'tone',
                      type: 'select',
                      label: label('Farbe', 'Tone'),
                      defaultValue: 'light',
                      options: [
                        { value: 'light', label: label('Hell (Moos)', 'Light (moss)') },
                        { value: 'dark', label: label('Dunkel (Neu)', 'Dark (new)') },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              name: 'cardTeaser',
              type: 'textarea',
              label: label('Kartentext', 'Card teaser'),
              required: true,
              maxLength: 140,
            },
            imageField({
              name: 'cardImage',
              label: label('Kartenfoto', 'Card photo'),
              tier: 'card',
            }),
          ],
        },
        {
          name: 'hero',
          label: label('Kopfbereich', 'Hero'),
          fields: [
            {
              name: 'eyebrow',
              type: 'text',
              label: label('Überzeile', 'Eyebrow'),
              maxLength: 40,
              admin: { description: label('z. B. „Kurs · sanft“', 'e.g. "Kurs · sanft"') },
            },
            {
              name: 'lead',
              type: 'textarea',
              label: label('Einleitung', 'Lead'),
              required: true,
              maxLength: 220,
            },
            {
              name: 'audienceLabel',
              type: 'text',
              label: label('Für wen (kurz)', 'Audience (short)'),
              maxLength: 60,
            },
            imageField({
              name: 'image',
              label: label('Titelbild', 'Hero image'),
              tier: 'feature',
              required: true,
            }),
            imageField({
              name: 'secondaryImage',
              label: label('Zweites Bild', 'Second image'),
              tier: 'card',
            }),
          ],
        },
        {
          name: 'audience',
          label: label('Für wen', 'Audience'),
          fields: [
            {
              name: 'heading',
              type: 'text',
              label: label('Überschrift', 'Heading'),
              defaultValue: 'Für wen ist der Kurs?',
              maxLength: 60,
            },
            {
              name: 'paragraphs',
              type: 'array',
              label: label('Absätze', 'Paragraphs'),
              minRows: 1,
              maxRows: 4,
              fields: [
                {
                  name: 'text',
                  type: 'textarea',
                  label: label('Text', 'Text'),
                  required: true,
                  maxLength: 400,
                },
              ],
            },
            {
              name: 'quote',
              type: 'textarea',
              label: label('Zitat (optional)', 'Quote (optional)'),
              maxLength: 160,
            },
          ],
        },
        {
          name: 'steps',
          label: label('In der Stunde', 'In class'),
          fields: [
            {
              name: 'heading',
              type: 'text',
              label: label('Überschrift', 'Heading'),
              required: true,
              maxLength: 60,
            },
            {
              name: 'items',
              type: 'array',
              label: label('Schritte', 'Steps'),
              maxRows: 6,
              fields: [
                {
                  name: 'title',
                  type: 'text',
                  label: label('Titel', 'Title'),
                  required: true,
                  maxLength: 40,
                },
                {
                  name: 'text',
                  type: 'textarea',
                  label: label('Text', 'Text'),
                  required: true,
                  maxLength: 220,
                },
                imageField({ name: 'image', label: label('Foto', 'Photo'), tier: 'card' }),
              ],
            },
          ],
        },
        {
          name: 'benefits',
          label: label('Wirkung', 'Benefits'),
          fields: [
            {
              name: 'heading',
              type: 'text',
              label: label('Überschrift', 'Heading'),
              required: true,
              maxLength: 60,
            },
            {
              name: 'items',
              type: 'array',
              label: label('Wirkungen', 'Benefits'),
              maxRows: 8,
              fields: [
                {
                  name: 'title',
                  type: 'text',
                  label: label('Titel', 'Title'),
                  required: true,
                  maxLength: 40,
                },
                {
                  name: 'text',
                  type: 'textarea',
                  label: label('Text', 'Text'),
                  required: true,
                  maxLength: 220,
                },
                imageField({ name: 'image', label: label('Foto', 'Photo'), tier: 'card' }),
              ],
            },
            imageField({
              name: 'sideImage',
              label: label('Seitenbild', 'Side image'),
              tier: 'card',
            }),
          ],
        },
        {
          label: label('Kurszeiten & Fragen', 'Schedule & FAQ'),
          fields: [
            {
              name: 'schedule',
              type: 'array',
              label: label('Kurszeiten (optional)', 'Schedule (optional)'),
              admin: {
                description: label(
                  'Leer = der Block wird nicht angezeigt; dann bleibt nur der Hinweis auf die WhatsApp-Gruppe.',
                  'Empty = the block is hidden; only the WhatsApp line remains.',
                ),
              },
              fields: [
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'weekday',
                      type: 'select',
                      label: label('Wochentag', 'Weekday'),
                      required: true,
                      options: WEEKDAYS.map((value) => ({
                        value,
                        label: { de: WEEKDAY_LABELS[value], en: WEEKDAY_LABELS_EN[value] },
                      })),
                    },
                    {
                      name: 'start',
                      type: 'text',
                      label: label('Beginn (HH:MM)', 'Start (HH:MM)'),
                      required: true,
                      validate: validateTime,
                    },
                    {
                      name: 'end',
                      type: 'text',
                      label: label('Ende (HH:MM)', 'End (HH:MM)'),
                      validate: validateEndAfterStart,
                    },
                  ],
                },
              ],
            },
            {
              name: 'faqs',
              type: 'array',
              label: label('Häufige Fragen', 'FAQ'),
              maxRows: 10,
              admin: {
                description: label(
                  '[Preis Probestunde] wird automatisch durch den Preis der Probestunde ersetzt.',
                  '[Preis Probestunde] is replaced with the trial price automatically.',
                ),
              },
              fields: [
                {
                  name: 'question',
                  type: 'text',
                  label: label('Frage', 'Question'),
                  required: true,
                  maxLength: 120,
                },
                {
                  name: 'answer',
                  type: 'textarea',
                  label: label('Antwort', 'Answer'),
                  required: true,
                  maxLength: 600,
                },
              ],
            },
          ],
        },
        {
          label: label('Suchmaschinen', 'SEO'),
          fields: [seoGroup()],
        },
      ],
    },
    slugField('title'),
    orderField(),
  ],
}
