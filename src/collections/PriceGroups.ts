import {
  ValidationError,
  type CollectionBeforeChangeHook,
  type CollectionConfig,
  type Where,
} from 'payload'

import { isLoggedIn, publishedOrLoggedIn } from '@/access'
import { collectionCacheHooks } from '@/cache/hooks'
import { CACHE_TAGS } from '@/cache/tags'
import { orderField } from '@/fields/builders'
import { ADMIN_GROUPS, label } from '@/fields/labels'
import { validatePrice } from '@/fields/validators'

import type { PriceGroup } from '@/payload-types'

import { trialRuleError } from './trialRule'

const priceGroupTags = () => [CACHE_TAGS.priceGroups]

/** Checked when a group is published; draft saves may be incomplete. See ./trialRule.ts. */
const priceGroupCacheHooks = collectionCacheHooks({ drafts: true, tags: priceGroupTags })

export const enforceTrialRule: CollectionBeforeChangeHook<PriceGroup> = async ({
  data,
  originalDoc,
  req,
}) => {
  if (data._status !== 'published') return data
  const blocks = data.blocks ?? originalDoc?.blocks
  const conditions: Where[] = [
    { _status: { equals: 'published' } },
    { 'blocks.isTrial': { equals: true } },
  ]
  if (originalDoc?.id !== undefined) conditions.push({ id: { not_equals: originalDoc.id } })
  const others = await req.payload.find({
    collection: 'price-groups',
    where: { and: conditions },
    depth: 0,
    pagination: false,
    overrideAccess: true,
    req,
  })
  const message = trialRuleError(blocks, others.docs)
  if (message) {
    throw new ValidationError({
      collection: 'price-groups',
      errors: [{ path: 'blocks', message }],
      req,
    })
  }
  return data
}

export const PriceGroups: CollectionConfig = {
  slug: 'price-groups',
  labels: {
    singular: label('Preisgruppe', 'Price group'),
    plural: label('Preisgruppen', 'Price groups'),
  },
  admin: {
    group: ADMIN_GROUPS.prices,
    useAsTitle: 'title',
    defaultColumns: ['title', 'kicker', 'order', '_status'],
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
  hooks: {
    ...priceGroupCacheHooks,
    beforeChange: [enforceTrialRule, ...priceGroupCacheHooks.beforeChange],
  },
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'kicker',
          type: 'text',
          label: label('Überzeile', 'Kicker'),
          required: true,
          maxLength: 24,
          admin: { description: label('z. B. „Mitgliedschaft“', 'e.g. "Mitgliedschaft"') },
        },
        {
          name: 'title',
          type: 'text',
          label: label('Titel', 'Title'),
          required: true,
          maxLength: 40,
          admin: { description: label('z. B. „Regelmäßig üben“', 'e.g. "Regelmäßig üben"') },
        },
      ],
    },
    {
      name: 'description',
      type: 'textarea',
      label: label('Beschreibung (optional)', 'Description (optional)'),
      maxLength: 240,
    },
    {
      name: 'blocks',
      type: 'array',
      label: label('Preis-Blöcke', 'Price blocks'),
      labels: { singular: label('Block', 'Block'), plural: label('Blöcke', 'Blocks') },
      minRows: 1,
      maxRows: 4,
      admin: {
        description: label(
          'Höchstens ein Block auf der ganzen Website ist die Probestunde. Ohne Probestunde wird das Angebot ausgeblendet.',
          'At most one block site-wide is the trial lesson. Without one, the trial offer is hidden.',
        ),
      },
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'name',
              type: 'text',
              label: label('Name', 'Name'),
              required: true,
              maxLength: 32,
              admin: { description: label('z. B. „2× pro Woche“', 'e.g. "2× pro Woche"') },
            },
            {
              name: 'badge',
              type: 'select',
              label: label('Etikett', 'Badge'),
              defaultValue: 'none',
              required: true,
              options: [
                { value: 'none', label: label('Keins', 'None') },
                { value: 'popular', label: label('Beliebt', 'Popular') },
                { value: 'promo', label: label('Aktion', 'Promo') },
              ],
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
                step: 0.5,
                description: label(
                  'Leer = noch nicht festgelegt; die Zeile wird ausgeblendet.',
                  'Empty = not set yet; the line is hidden.',
                ),
              },
            },
            {
              name: 'unit',
              type: 'text',
              label: label('Einheit', 'Unit'),
              maxLength: 24,
              admin: {
                description: label(
                  'z. B. „pro Monat“, „einmalig“, „für 10 Stunden“',
                  'e.g. "pro Monat", "einmalig", "für 10 Stunden"',
                ),
              },
            },
          ],
        },
        {
          name: 'inclusions',
          type: 'array',
          label: label('Leistungen', 'Inclusions'),
          maxRows: 6,
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
              maxLength: 80,
            },
          ],
        },
        {
          type: 'row',
          fields: [
            {
              name: 'action',
              type: 'select',
              label: label('Schaltfläche', 'Button'),
              defaultValue: 'signup',
              required: true,
              options: [
                { value: 'signup', label: label('Zum Anmeldeformular', 'Signup form') },
                { value: 'whatsapp', label: label('Per WhatsApp anfragen', 'Ask via WhatsApp') },
              ],
            },
            {
              name: 'highlighted',
              type: 'checkbox',
              label: label('Hervorheben', 'Highlight'),
              defaultValue: false,
            },
          ],
        },
        {
          type: 'row',
          fields: [
            {
              name: 'isTrial',
              type: 'checkbox',
              label: label('Ist die Probestunde', 'Is the trial lesson'),
              defaultValue: false,
            },
            {
              name: 'showInSignupForm',
              type: 'checkbox',
              label: label('Im Anmeldeformular wählbar', 'Selectable in signup form'),
              defaultValue: false,
            },
          ],
        },
        {
          name: 'course',
          type: 'relationship',
          relationTo: 'courses',
          label: label('Preis auf einer Kursseite zeigen', 'Show the price on a course page'),
          admin: {
            description: label(
              'Optional. Der Preis erscheint dann oben auf dieser Kursseite, z. B. „Yoga für Jugendliche: 45 €“.',
              'Optional. The price then appears at the top of that course page.',
            ),
          },
        },
      ],
    },
    orderField(),
  ],
}
