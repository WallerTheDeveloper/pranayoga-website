import type { FieldHook, PayloadRequest, SanitizedCollectionConfig, TextField } from 'payload'

import { canResolveSlug, slugify } from '@/lib/validation/slug'

import { label } from './labels'

/**
 * Context flag for a maintenance script that renames a published slug on purpose, together with a
 * 301 in Redirects (docs/PLAN.md "Course URL slugs"). The admin never sets it.
 */
export const ALLOW_SLUG_CHANGE = 'allowSlugChange'

const MISSING_SLUG_MESSAGE = 'Bitte einen Titel eingeben: daraus entsteht das URL-Kürzel.'

function textOf(value: unknown): string | null {
  return typeof value === 'string' ? slugify(value) || null : null
}

interface LockCheck {
  collection: SanitizedCollectionConfig | null
  originalDoc: Record<string, unknown> | undefined
  req: PayloadRequest
}

/**
 * Once any version was published, the URL may be live, bookmarked or indexed, so the slug stays,
 * even after unpublishing. Without drafts every saved document is live.
 */
async function wasEverPublished({ collection, originalDoc, req }: LockCheck): Promise<boolean> {
  if (!originalDoc || !collection) return false
  if (!collection.versions?.drafts) return true
  if (originalDoc._status === 'published') return true
  const { totalDocs } = await req.payload.countVersions({
    collection: collection.slug,
    where: {
      and: [{ parent: { equals: originalDoc.id } }, { 'version._status': { equals: 'published' } }],
    },
    req,
  })
  return totalDocs > 0
}

/**
 * The admin autosaves a new document before its title is typed, so "create" is usually an empty
 * draft. The slug therefore follows the title on every save until the first publish, then stays.
 * On create an explicit slug (seed, API) wins. Empty means `null`, so untitled drafts never clash
 * on the unique index.
 */
function slugFromTitle(sourceField: string): FieldHook {
  return async ({ operation, value, data, originalDoc, collection, req }) => {
    const requested = textOf(value)
    const title = data?.[sourceField] ?? originalDoc?.[sourceField]
    if (operation === 'create') return requested ?? textOf(title)
    if (req.context[ALLOW_SLUG_CHANGE] === true && requested) return requested
    const stored = textOf(originalDoc?.slug)
    if (await wasEverPublished({ collection, originalDoc, req })) return stored
    return textOf(title) ?? stored
  }
}

/**
 * URL slug, made from the title until the first publish and locked after that (docs/PLAN.md
 * "Course URL slugs"). The hook decides the value, so the admin shows it read-only.
 */
export function slugField(sourceField = 'title'): TextField {
  return {
    name: 'slug',
    type: 'text',
    label: label('URL-Kürzel', 'URL slug'),
    unique: true,
    index: true,
    required: true,
    // Replaces the plain required check: the admin validates the form before saving, while the
    // slug is still empty and only the hook will fill it in from the title.
    validate: (value, { siblingData }) =>
      canResolveSlug(value, (siblingData as Record<string, unknown> | undefined)?.[sourceField])
        ? true
        : MISSING_SLUG_MESSAGE,
    hooks: { beforeValidate: [slugFromTitle(sourceField)] },
    admin: {
      position: 'sidebar',
      readOnly: true,
      description: label(
        'Entsteht beim Speichern aus dem Titel. Nach der ersten Veröffentlichung bleibt es fest (Teil der Adresse).',
        'Made from the title on save. Fixed after the first publish (part of the URL).',
      ),
    },
  }
}
