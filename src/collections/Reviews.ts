import type { CollectionConfig } from 'payload'

import { isLoggedIn, publishedOrLoggedIn } from '@/access'
import { collectionCacheHooks } from '@/cache/hooks'
import { CACHE_TAGS } from '@/cache/tags'
import { orderField } from '@/fields/builders'
import { ADMIN_GROUPS, label } from '@/fields/labels'

const reviewTags = () => [CACHE_TAGS.reviews]

export const Reviews: CollectionConfig = {
  slug: 'reviews',
  labels: {
    singular: label('Bewertung', 'Review'),
    plural: label('Bewertungen', 'Reviews'),
  },
  admin: {
    group: ADMIN_GROUPS.content,
    useAsTitle: 'author',
    defaultColumns: ['author', 'source', 'order', '_status'],
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
    maxPerDoc: 10,
    drafts: { autosave: { interval: 800 }, schedulePublish: false },
  },
  hooks: collectionCacheHooks({ drafts: true, tags: reviewTags }),
  fields: [
    {
      name: 'author',
      type: 'text',
      label: label('Name', 'Name'),
      required: true,
      maxLength: 60,
    },
    {
      name: 'text',
      type: 'textarea',
      label: label('Bewertung', 'Review text'),
      required: true,
      maxLength: 400,
      admin: {
        description: label(
          'Wörtlich übernehmen; Kürzungen mit „…“ kennzeichnen.',
          'Quote verbatim; mark cuts with "…".',
        ),
      },
    },
    {
      name: 'source',
      type: 'text',
      label: label('Quelle', 'Source'),
      defaultValue: 'Google-Bewertung',
      maxLength: 40,
    },
    orderField(),
  ],
}
