import { readdirSync, rmSync } from 'node:fs'
import path from 'node:path'

import type { Payload } from 'payload'

import type { SeedImage } from '../manifest'
import { SEED_WRITE } from './context'

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * Payload renames an upload when a file of that name is already on disk ("x-1.jpg"), even if no
 * document points at it. After a database reset that would break the file names the copy modules
 * look up, so the seed removes such orphans (the original and its generated sizes) first. Only
 * called for names no media document uses.
 */
function removeOrphanedFiles(staticDir: string, filename: string): string[] {
  let entries: string[]
  try {
    entries = readdirSync(staticDir)
  } catch {
    return []
  }
  const extension = path.extname(filename)
  const base = escapeRegExp(filename.slice(0, -extension.length))
  const pattern = new RegExp(`^${base}(-\\d+x\\d+)?${escapeRegExp(extension)}$`)
  const orphans = entries.filter((entry) => pattern.test(entry))
  for (const orphan of orphans) rmSync(path.join(staticDir, orphan))
  return orphans
}

async function findByFilename(payload: Payload, filename: string) {
  const result = await payload.find({
    collection: 'media',
    where: { filename: { equals: filename } },
    depth: 0,
    limit: 1,
    pagination: false,
    overrideAccess: true,
  })
  return result.docs[0]
}

async function upsertImage(
  payload: Payload,
  image: SeedImage,
  imagesDir: string,
  staticDir: string,
): Promise<number> {
  const existing = await findByFilename(payload, image.file)
  if (existing) {
    if (existing.alt !== image.alt) {
      await payload.update({
        collection: 'media',
        id: existing.id,
        data: { alt: image.alt },
        ...SEED_WRITE,
      })
    }
    return existing.id
  }

  const removed = removeOrphanedFiles(staticDir, image.file)
  if (removed.length > 0)
    payload.logger.warn(`Removed orphaned upload files: ${removed.join(', ')}`)

  const created = await payload.create({
    collection: 'media',
    data: { alt: image.alt },
    filePath: path.join(imagesDir, image.file),
    ...SEED_WRITE,
  })
  if (created.filename !== image.file) {
    throw new Error(`Upload stored as "${created.filename ?? '?'}" instead of "${image.file}"`)
  }
  return created.id
}

/** Uploads every manifest image once; re-runs only refresh the alt text. */
export async function seedMedia(
  payload: Payload,
  images: readonly SeedImage[],
  imagesDir: string,
): Promise<Map<string, number>> {
  const staticDir = payload.collections.media.config.upload.staticDir
  if (!staticDir) throw new Error('Media collection has no staticDir')

  const ids = new Map<string, number>()
  for (const image of images) {
    ids.set(image.file, await upsertImage(payload, image, imagesDir, staticDir))
  }
  payload.logger.info(`Media: ${ids.size} images`)
  return ids
}
