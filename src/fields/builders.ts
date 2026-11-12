import type { Field, GroupField, UploadField } from 'payload'

import {
  IMAGE_TIER_LABELS,
  IMAGE_TIER_MIN_SHORT_SIDE,
  type ImageTier,
} from '@/lib/validation/imageTier'

import { label, type Label } from './labels'
import { validateImageTier } from './validators'

interface ImageFieldOptions {
  name: string
  label: Label
  tier: ImageTier
  required?: boolean
  description?: Label
}

/** Upload field for one photo tier, with the minimum-size guardrail. */
export function imageField({
  name,
  label: fieldLabel,
  tier,
  required = false,
  description,
}: ImageFieldOptions): UploadField {
  const minimum = IMAGE_TIER_MIN_SHORT_SIDE[tier]
  const tierName = IMAGE_TIER_LABELS[tier]
  return {
    name,
    type: 'upload',
    relationTo: 'media',
    label: fieldLabel,
    required,
    validate: validateImageTier(tier),
    admin: {
      description: description ?? {
        de: `${tierName.de}: kürzere Seite mindestens ${minimum} Pixel.`,
        en: `${tierName.en}: shorter side at least ${minimum} pixels.`,
      },
    },
  }
}

/** Sort order in lists; lower numbers first. */
export function orderField(): Field {
  return {
    name: 'order',
    type: 'number',
    label: label('Reihenfolge', 'Order'),
    defaultValue: 0,
    admin: {
      position: 'sidebar',
      description: label('Kleinere Zahlen stehen weiter oben.', 'Lower numbers come first.'),
    },
  }
}

interface SeoGroupOptions {
  name?: string
  label?: Label
  description?: Label
}

/** SEO title, description and share image. Empty values fall back to technical-settings. */
export function seoGroup({
  name = 'seo',
  label: groupLabel = label('Suchmaschinen', 'SEO'),
  description = label(
    'Optional. Leer gelassen, werden Titel und Beschreibung automatisch erzeugt.',
    'Optional. When empty, title and description are generated.',
  ),
}: SeoGroupOptions = {}): GroupField {
  return {
    name,
    type: 'group',
    label: groupLabel,
    admin: { description },
    fields: [
      { name: 'title', type: 'text', label: label('Titel', 'Title'), maxLength: 60 },
      {
        name: 'description',
        type: 'textarea',
        label: label('Beschreibung', 'Description'),
        maxLength: 160,
      },
      imageField({ name: 'image', label: label('Vorschaubild', 'Share image'), tier: 'card' }),
    ],
  }
}
