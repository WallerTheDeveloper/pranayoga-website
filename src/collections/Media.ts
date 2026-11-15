import path from 'node:path'

import { APIError, type CollectionBeforeDeleteHook, type CollectionConfig } from 'payload'

import { anyone, isLoggedIn } from '@/access'
import { collectionCacheHooks } from '@/cache/hooks'
import { CACHE_TAGS } from '@/cache/tags'
import { COPY_MEDIA_PLACES } from '@/content/copy/mediaRefs'
import { ADMIN_GROUPS, label } from '@/fields/labels'
import { getMediaDir } from '@/lib/env'

import { findMediaUsage } from './mediaUsage'

/** Images still shown somewhere on the site cannot be deleted. */
export const preventDeletingUsedMedia: CollectionBeforeDeleteHook = async ({ id, req }) => {
  const doc = await req.payload.findByID({
    collection: 'media',
    id,
    depth: 0,
    req,
    overrideAccess: true,
    disableErrors: true,
  })
  const usage = await findMediaUsage({
    payload: req.payload,
    req,
    id,
    filename: doc?.filename,
    copyFilenames: COPY_MEDIA_PLACES,
  })
  if (usage.places.length > 0) {
    throw new APIError(
      `Dieses Bild wird noch verwendet (${usage.places.join('; ')}). Bitte zuerst dort ersetzen.`,
      409,
      { places: usage.places },
      true,
    )
  }
}

const mediaTags = () => [CACHE_TAGS.media]

export const Media: CollectionConfig = {
  slug: 'media',
  labels: {
    singular: label('Bild', 'Image'),
    plural: label('Bilder', 'Images'),
  },
  admin: {
    group: ADMIN_GROUPS.content,
    useAsTitle: 'alt',
    defaultColumns: ['filename', 'alt', 'width', 'height', 'updatedAt'],
  },
  access: {
    read: anyone,
    create: isLoggedIn,
    update: isLoggedIn,
    delete: isLoggedIn,
  },
  hooks: {
    ...collectionCacheHooks({ drafts: false, tags: mediaTags }),
    beforeDelete: [preventDeletingUsedMedia],
  },
  upload: {
    // Server disk, outside git and the Docker build context (docs/PLAN.md "Media & file storage").
    // Relative to the working directory (project root; /app in the image). No explicit
    // process.cwd(): the build tracer would then copy the whole project into the image.
    staticDir: path.resolve(getMediaDir()),
    mimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
    focalPoint: true,
    crop: true,
    adminThumbnail: 'small',
    // Tier sizes at 1.5× for sharp phone screens; never upscaled, never cropped.
    imageSizes: [
      { name: 'feature', width: 900, height: 1140, fit: 'inside', withoutEnlargement: true },
      { name: 'card', width: 660, height: 990, fit: 'inside', withoutEnlargement: true },
      { name: 'small', width: 495, height: 495, fit: 'inside', withoutEnlargement: true },
    ],
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      label: label('Alternativtext', 'Alt text'),
      required: true,
      maxLength: 200,
      admin: {
        description: label(
          'Beschreibt das Bild für Menschen, die es nicht sehen können. Pflichtfeld.',
          'Describes the image for people who cannot see it. Required.',
        ),
      },
    },
  ],
}
