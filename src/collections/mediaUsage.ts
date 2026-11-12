import type { Field, Payload, PayloadRequest } from 'payload'

/**
 * Finds where a media document is still used, so it cannot be deleted from under a page.
 * Upload paths are read from the live Payload config, so new image fields are covered automatically.
 */

export function collectMediaPaths(fields: readonly Field[], prefix = ''): string[] {
  const paths: string[] = []
  for (const field of fields) {
    switch (field.type) {
      case 'upload':
        if (field.relationTo === 'media') paths.push(`${prefix}${field.name}`)
        break
      case 'group':
        paths.push(
          ...collectMediaPaths(
            field.fields,
            'name' in field && field.name ? `${prefix}${field.name}.` : prefix,
          ),
        )
        break
      case 'array':
        paths.push(...collectMediaPaths(field.fields, `${prefix}${field.name}.`))
        break
      case 'row':
      case 'collapsible':
        paths.push(...collectMediaPaths(field.fields, prefix))
        break
      case 'tabs':
        for (const tab of field.tabs) {
          const tabPrefix = 'name' in tab && tab.name ? `${prefix}${tab.name}.` : prefix
          paths.push(...collectMediaPaths(tab.fields, tabPrefix))
        }
        break
      default:
        break
    }
  }
  return paths
}

function idOf(value: unknown): string | number | undefined {
  if (typeof value === 'number' || typeof value === 'string') return value
  if (typeof value === 'object' && value !== null && 'id' in value) {
    const id = (value as { id: unknown }).id
    if (typeof id === 'number' || typeof id === 'string') return id
  }
  return undefined
}

/** All values at a dotted path, walking through arrays. */
export function valuesAtPath(source: unknown, path: string): unknown[] {
  const [head, ...rest] = path.split('.')
  if (head === undefined || source === null || source === undefined) return []
  if (Array.isArray(source)) return source.flatMap((item) => valuesAtPath(item, path))
  if (typeof source !== 'object') return []
  const next = (source as Record<string, unknown>)[head]
  if (rest.length === 0) return Array.isArray(next) ? next : [next]
  return valuesAtPath(next, rest.join('.'))
}

export interface MediaUsage {
  /** Human-readable places, e.g. "courses: Hatha Yoga" or "Startseite (Text-Modul)". */
  places: string[]
}

interface FindUsageArgs {
  payload: Payload
  req?: PayloadRequest
  id: number | string
  filename?: string | null
  /** File names referenced by the typed copy modules (src/content/copy). */
  copyFilenames?: ReadonlyMap<string, string>
}

export async function findMediaUsage({
  payload,
  req,
  id,
  filename,
  copyFilenames,
}: FindUsageArgs): Promise<MediaUsage> {
  const places: string[] = []

  for (const collection of payload.config.collections) {
    if (collection.slug === 'media') continue
    const paths = collectMediaPaths(collection.fields)
    if (paths.length === 0) continue
    const where = { or: paths.map((path) => ({ [path]: { equals: id } })) }
    const titleField = collection.admin?.useAsTitle ?? 'id'
    for (const draft of collection.versions &&
    'drafts' in collection.versions &&
    collection.versions.drafts
      ? [false, true]
      : [false]) {
      const result = await payload.find({
        collection: collection.slug,
        where,
        depth: 0,
        draft,
        limit: 20,
        pagination: false,
        overrideAccess: true,
        req,
      })
      for (const doc of result.docs) {
        const title = (doc as object as Record<string, unknown>)[titleField]
        const place = `${collection.slug}: ${String(title ?? doc.id)}`
        if (!places.includes(place)) places.push(place)
      }
    }
  }

  for (const global of payload.config.globals) {
    const paths = collectMediaPaths(global.fields)
    if (paths.length === 0) continue
    // Like the collections above: an unpublished draft may still point at the image.
    const versions = global.versions
    const hasDrafts = typeof versions === 'object' && versions !== null && Boolean(versions.drafts)
    for (const draft of hasDrafts ? [false, true] : [false]) {
      const doc = await payload.findGlobal({
        slug: global.slug,
        depth: 0,
        draft,
        overrideAccess: true,
        req,
      })
      const used = paths.some((path) =>
        valuesAtPath(doc, path).some((value) => String(idOf(value)) === String(id)),
      )
      if (used && !places.includes(global.slug)) places.push(global.slug)
    }
  }

  if (filename && copyFilenames?.has(filename)) {
    places.push(copyFilenames.get(filename) ?? filename)
  }

  return { places }
}
