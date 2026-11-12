import type { GlobalConfig } from 'payload'

import { isLoggedIn, publishedOrLoggedIn } from '@/access'
import { globalCacheHooks } from '@/cache/hooks'
import { CACHE_TAGS } from '@/cache/tags'
import { seoGroup } from '@/fields/builders'
import { ADMIN_GROUPS, label } from '@/fields/labels'
import { validateGoogleMapsEmbedUrl, validateSiteOrigin } from '@/fields/validators'

/** Site-wide technical switches. No autosave: a half-typed change here should never go live. */
export const TechnicalSettings: GlobalConfig = {
  slug: 'technical-settings',
  label: label('Technische Einstellungen', 'Technical settings'),
  admin: {
    group: ADMIN_GROUPS.technical,
    description: label(
      'Technische Einstellungen. Bitte nur nach Absprache ändern.',
      'Technical settings. Change only after checking with the developer.',
    ),
  },
  access: {
    read: publishedOrLoggedIn,
    update: isLoggedIn,
    readVersions: isLoggedIn,
  },
  versions: {
    max: 25,
    drafts: { autosave: false, schedulePublish: false },
  },
  hooks: globalCacheHooks({ drafts: true, tags: [CACHE_TAGS.technicalSettings] }),
  fields: [
    {
      name: 'siteUrl',
      type: 'text',
      label: label('Adresse der Website', 'Site URL'),
      required: true,
      validate: validateSiteOrigin,
      admin: {
        description: label(
          'Für Links in Suchmaschinen und beim Teilen, z. B. https://pranayogastudio.de',
          'Used for canonical and share links, e.g. https://pranayogastudio.de',
        ),
      },
    },
    {
      name: 'noindex',
      type: 'checkbox',
      label: label('Vor Suchmaschinen verbergen', 'Hide from search engines'),
      defaultValue: true,
      admin: {
        description: label(
          'Bis zum Start eingeschaltet lassen. Beim Start ausschalten.',
          'Keep on until launch, then switch off.',
        ),
      },
    },
    seoGroup({
      name: 'defaultSeo',
      label: label('Standard für Suchmaschinen', 'Default SEO'),
      description: label(
        'Wird verwendet, wenn eine Seite keine eigenen Angaben hat.',
        'Used when a page has no SEO values of its own.',
      ),
    }),
    {
      name: 'featureFlags',
      type: 'group',
      label: label('Funktionen', 'Feature flags'),
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'introLoader',
              type: 'checkbox',
              label: label('Lade-Animation beim ersten Besuch', 'Intro loader'),
              defaultValue: false,
            },
            {
              name: 'cookieBanner',
              type: 'checkbox',
              label: label('Cookie-Hinweis', 'Cookie banner'),
              defaultValue: false,
              admin: {
                description: label(
                  'Derzeit nicht nötig: die Website setzt keine Cookies für Besucher.',
                  'Not needed today: the site sets no visitor cookies.',
                ),
              },
            },
          ],
        },
      ],
    },
    {
      name: 'googleMapsEmbedUrl',
      type: 'text',
      label: label('Google-Maps-Karte (Einbettungs-Adresse)', 'Google Maps embed URL'),
      validate: validateGoogleMapsEmbedUrl,
      admin: {
        description: label(
          'Wird erst nach Klick auf „Karte laden“ auf der Kontaktseite geladen.',
          'Loaded on the contact page only after "Karte laden" is clicked.',
        ),
      },
    },
  ],
}
