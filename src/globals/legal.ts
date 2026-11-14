import {
  HeadingFeature,
  LinkFeature,
  lexicalEditor,
  type FeatureProviderServer,
} from '@payloadcms/richtext-lexical'
import type { GlobalConfig } from 'payload'

import { isLoggedIn, publishedOrLoggedIn } from '@/access'
import { globalCacheHooks } from '@/cache/hooks'
import { CACHE_TAGS } from '@/cache/tags'
import { ADMIN_GROUPS, label, type Label } from '@/fields/labels'

/** Features a legal text never needs: images, embedded documents, layout tools. */
const DROPPED_FEATURES = new Set([
  'upload',
  'relationship',
  'blocks',
  'inlineBlocks',
  'checklist',
  'indent',
  'align',
  'subscript',
  'superscript',
  'inlineCode',
  'heading',
  'link',
])

/**
 * Plain legal prose: paragraphs, h2/h3 headings, lists, bold and italic, and links to web
 * addresses only (no internal links, so the text needs no lookups to render).
 */
export const legalTextEditor = lexicalEditor({
  features: ({ defaultFeatures }: { defaultFeatures: FeatureProviderServer[] }) => [
    ...defaultFeatures.filter((feature) => !DROPPED_FEATURES.has(feature.key)),
    HeadingFeature({ enabledHeadingSizes: ['h2', 'h3'] }),
    LinkFeature({ enabledCollections: [] }),
  ],
})

interface LegalGlobalOptions {
  slug: 'legal-notice' | 'privacy-policy'
  title: Label
  tag: string
}

/**
 * Impressum and Datenschutz: legal texts the studio (or its legal advice) writes. "Stand" is a
 * date shown under the heading; the text is rich text. Drafts let a new version be prepared and
 * published in one go.
 */
function legalGlobal({ slug, title, tag }: LegalGlobalOptions): GlobalConfig {
  return {
    slug,
    label: title,
    admin: {
      group: ADMIN_GROUPS.settings,
      description: label(
        'Rechtstext. Bitte nur den Text einfügen, den Sie von Ihrer Rechtsberatung erhalten haben.',
        'Legal text. Paste only the text provided by your legal advisor.',
      ),
    },
    access: {
      read: publishedOrLoggedIn,
      update: isLoggedIn,
      readVersions: isLoggedIn,
    },
    versions: {
      max: 25,
      drafts: { autosave: { interval: 1500 }, schedulePublish: false },
    },
    hooks: globalCacheHooks({ drafts: true, tags: [tag] }),
    fields: [
      {
        name: 'updatedOn',
        type: 'date',
        label: label('Stand', 'Last updated'),
        admin: {
          date: { pickerAppearance: 'dayOnly', displayFormat: 'dd.MM.yyyy' },
          description: label(
            'Erscheint als „Stand: …“ unter der Überschrift. Leer = keine Angabe.',
            'Shown as "Stand: …" under the heading. Empty = not shown.',
          ),
        },
      },
      {
        name: 'content',
        type: 'richText',
        label: label('Text', 'Text'),
        editor: legalTextEditor,
        admin: {
          description: label(
            'Zwischenüberschriften als „Überschrift 2“ formatieren. Absätze mit Platzhaltern in eckigen Klammern [ … ] bleiben auf der Website ausgeblendet.',
            'Format section titles as "Heading 2". Paragraphs with placeholders in square brackets [ … ] stay hidden on the website.',
          ),
        },
      },
    ],
  }
}

export const LegalNotice = legalGlobal({
  slug: 'legal-notice',
  title: label('Impressum', 'Legal notice'),
  tag: CACHE_TAGS.legalNotice,
})

export const PrivacyPolicy = legalGlobal({
  slug: 'privacy-policy',
  title: label('Datenschutzerklärung', 'Privacy policy'),
  tag: CACHE_TAGS.privacyPolicy,
})
