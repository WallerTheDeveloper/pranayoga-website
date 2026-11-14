import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { postgresAdapter } from '@payloadcms/db-postgres'
import { redirectsPlugin } from '@payloadcms/plugin-redirects'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { de } from '@payloadcms/translations/languages/de'
import { en } from '@payloadcms/translations/languages/en'
import { buildConfig } from 'payload'
import sharp from 'sharp'

import { Courses } from './collections/Courses'
import { Downloads } from './collections/Downloads'
import { Media } from './collections/Media'
import { PriceGroups } from './collections/PriceGroups'
import { redirectsPluginConfig } from './collections/redirects'
import { Reviews } from './collections/Reviews'
import { Users } from './collections/Users'
import { BusinessSettings } from './globals/BusinessSettings'
import { LegalNotice, PrivacyPolicy } from './globals/legal'
import { TeacherTraining } from './globals/TeacherTraining'
import { TechnicalSettings } from './globals/TechnicalSettings'
import { getServerEnv } from './lib/env'
import { previewPathFor, previewUrl } from './lib/preview'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

const env = getServerEnv()

/** 15 MB per upload (docs/PLAN.md "Media & file storage"). */
const MAX_UPLOAD_BYTES = 15 * 1024 * 1024

export default buildConfig({
  serverURL: env.NEXT_PUBLIC_SERVER_URL,
  secret: env.PAYLOAD_SECRET,
  telemetry: false,
  admin: {
    user: Users.slug,
    importMap: { baseDir: path.resolve(dirname) },
    meta: { titleSuffix: ' · Pranayoga Admin' },
    livePreview: {
      collections: [Courses.slug, PriceGroups.slug, Reviews.slug],
      globals: [BusinessSettings.slug, TeacherTraining.slug, LegalNotice.slug, PrivacyPolicy.slug],
      breakpoints: [
        { name: 'mobile', label: 'Handy', width: 390, height: 844 },
        { name: 'tablet', label: 'Tablet', width: 768, height: 1024 },
        { name: 'desktop', label: 'Desktop', width: 1440, height: 900 },
      ],
      url: ({ data, collectionConfig, globalConfig }) => {
        const path = collectionConfig
          ? previewPathFor({ kind: 'collection', slug: collectionConfig.slug, data })
          : globalConfig
            ? previewPathFor({ kind: 'global', slug: globalConfig.slug })
            : null
        if (!path) return null
        return previewUrl({
          origin: env.NEXT_PUBLIC_SERVER_URL,
          secret: env.PREVIEW_SECRET,
          path,
        })
      },
    },
  },
  i18n: {
    supportedLanguages: { de, en },
    fallbackLanguage: 'de',
  },
  collections: [Courses, PriceGroups, Reviews, Media, Downloads, Users],
  globals: [BusinessSettings, TeacherTraining, LegalNotice, PrivacyPolicy, TechnicalSettings],
  editor: lexicalEditor(),
  graphQL: { disable: true },
  cors: [env.NEXT_PUBLIC_SERVER_URL],
  csrf: [env.NEXT_PUBLIC_SERVER_URL],
  upload: { limits: { fileSize: MAX_UPLOAD_BYTES } },
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: { connectionString: env.DATABASE_URI },
  }),
  sharp,
  plugins: [redirectsPlugin(redirectsPluginConfig)],
})
