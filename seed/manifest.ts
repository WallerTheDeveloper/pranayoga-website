import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'

import { z } from 'zod'

/** English kebab-case file names only, so URLs and the copy modules stay predictable. */
const FILE_NAME = /^[a-z0-9]+(-[a-z0-9]+)*\.(jpg|png|webp)$/

const manifestSchema = z.object({
  images: z
    .array(
      z.object({
        blob: z.string().min(1),
        file: z.string().regex(FILE_NAME, 'must be a lowercase kebab-case .jpg/.png/.webp name'),
        alt: z.string().trim().min(1).max(200),
        pages: z.array(z.string().min(1)).min(1),
        /** Focal point in percent, for crops the design sets (object-position). */
        focal: z
          .object({ x: z.number().min(0).max(100), y: z.number().min(0).max(100) })
          .optional(),
      }),
    )
    .min(1),
})

export type SeedManifest = z.infer<typeof manifestSchema>
export type SeedImage = SeedManifest['images'][number]

/** Reads and validates seed/manifest.json; every listed file must exist in the images folder. */
export function loadManifest(manifestPath: string, imagesDir: string): SeedManifest {
  const raw: unknown = JSON.parse(readFileSync(manifestPath, 'utf8'))
  const manifest = manifestSchema.parse(raw)

  const names = manifest.images.map((image) => image.file)
  const duplicates = names.filter((name, index) => names.indexOf(name) !== index)
  if (duplicates.length > 0)
    throw new Error(`Duplicate files in manifest: ${duplicates.join(', ')}`)

  const missing = names.filter((name) => !existsSync(path.join(imagesDir, name)))
  if (missing.length > 0) throw new Error(`Manifest files missing on disk: ${missing.join(', ')}`)

  return manifest
}

/** Fails before any write when seed data references an image the manifest doesn't list. */
export function assertImagesListed(manifest: SeedManifest, referenced: Iterable<string>): void {
  const listed = new Set(manifest.images.map((image) => image.file))
  const unknown = [...new Set(referenced)].filter((name) => !listed.has(name))
  if (unknown.length > 0)
    throw new Error(`Seed data references unlisted images: ${unknown.join(', ')}`)
}
