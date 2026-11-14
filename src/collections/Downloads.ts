import path from 'node:path'

import type { CollectionConfig } from 'payload'

import { anyone, isLoggedIn } from '@/access'
import { collectionCacheHooks } from '@/cache/hooks'
import { CACHE_TAGS } from '@/cache/tags'
import { ADMIN_GROUPS, label } from '@/fields/labels'
import { getDownloadsDir } from '@/lib/env'
import { DOWNLOAD_USAGES } from '@/lib/downloads'

const downloadTags = () => [CACHE_TAGS.downloads]

/** Where each usage appears; also the admin's option labels. */
const USAGE_LABELS = {
  'membership-contract': label('Vertrag (Mitgliedschaft & Preise)', 'Contract (pricing page)'),
  'teacher-training-flyer': label('Flyer (Yogaausbildung)', 'Flyer (teacher training)'),
} as const satisfies Record<(typeof DOWNLOAD_USAGES)[number], ReturnType<typeof label>>

/**
 * PDFs visitors can download: the membership contract and the teacher-training flyer. Each usage
 * belongs to one file at most; without one, the page hides its download button. Like images,
 * files have no drafts: a new upload is live at once.
 */
export const Downloads: CollectionConfig = {
  slug: 'downloads',
  labels: {
    singular: label('Download', 'Download'),
    plural: label('Downloads', 'Downloads'),
  },
  admin: {
    group: ADMIN_GROUPS.content,
    useAsTitle: 'title',
    defaultColumns: ['title', 'usage', 'filename', 'updatedAt'],
    description: label(
      'PDF-Dateien zum Herunterladen. Eine neue Version: Datei im selben Eintrag ersetzen.',
      'PDF files to download. For a new version, replace the file in the same entry.',
    ),
  },
  access: {
    read: anyone,
    create: isLoggedIn,
    update: isLoggedIn,
    delete: isLoggedIn,
  },
  hooks: collectionCacheHooks({ drafts: false, tags: downloadTags }),
  upload: {
    // Server disk next to the images (docs/PLAN.md "Media & file storage").
    staticDir: path.resolve(process.cwd(), getDownloadsDir()),
    mimeTypes: ['application/pdf'],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      label: label('Titel', 'Title'),
      required: true,
      maxLength: 80,
      admin: {
        description: label('z. B. „Mitgliedsvertrag 2027“', 'e.g. "Mitgliedsvertrag 2027"'),
      },
    },
    {
      name: 'usage',
      type: 'select',
      label: label('Verwendung auf der Website', 'Used on the site'),
      unique: true,
      options: DOWNLOAD_USAGES.map((value) => ({ value, label: USAGE_LABELS[value] })),
      admin: {
        description: label(
          'Jede Verwendung gehört zu höchstens einer Datei. Leer = die Datei erscheint nirgends.',
          'Each usage belongs to one file at most. Empty = the file is not linked anywhere.',
        ),
      },
    },
  ],
}
