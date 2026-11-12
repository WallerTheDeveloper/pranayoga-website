import type { RedirectsPluginConfig } from '@payloadcms/plugin-redirects/types'
import type { Field, FieldHook } from 'payload'

import { isLoggedIn } from '@/access'
import { collectionCacheHooks } from '@/cache/hooks'
import { CACHE_TAGS } from '@/cache/tags'
import { ADMIN_GROUPS, label } from '@/fields/labels'
import { validateRedirectSource, validateRedirectTarget } from '@/fields/validators'
import { normalizeRedirectSource } from '@/lib/validation/url'

const redirectTags = () => [CACHE_TAGS.redirects]

const normalizeSource: FieldHook = ({ value }) =>
  typeof value === 'string' ? (normalizeRedirectSource(value) ?? value) : value

/** Adds path normalisation and validation to the plugin's `from` and `to.url` fields. */
function withGuardrails(fields: Field[]): Field[] {
  return fields.map((field) => {
    if (field.type === 'text' && field.name === 'from' && !field.hasMany) {
      return {
        ...field,
        validate: validateRedirectSource,
        hooks: { ...field.hooks, beforeValidate: [normalizeSource] },
        admin: {
          ...field.admin,
          description: label(
            'Alte Adresse, z. B. /kurse/yin-yoga/',
            'Old path, e.g. /kurse/yin-yoga/',
          ),
        },
      }
    }
    if (field.type === 'group' && 'name' in field && field.name === 'to') {
      return {
        ...field,
        fields: field.fields.map((child) =>
          child.type === 'text' && child.name === 'url' && !child.hasMany
            ? { ...child, validate: validateRedirectTarget }
            : child,
        ),
      }
    }
    return field
  })
}

/**
 * Old WordPress URLs → new pages (permanent). The plugin only stores them; the course page looks
 * them up for unknown slugs (phase 2). Technical, so it sits under "Technik".
 */
export const redirectsPluginConfig: RedirectsPluginConfig = {
  collections: ['courses'],
  overrides: {
    labels: {
      singular: label('Weiterleitung', 'Redirect'),
      plural: label('Weiterleitungen', 'Redirects'),
    },
    admin: {
      group: ADMIN_GROUPS.technical,
      useAsTitle: 'from',
      description: label(
        'Leitet alte Adressen dauerhaft auf neue Seiten um (technisch).',
        'Permanently forwards old addresses to new pages (technical).',
      ),
    },
    access: {
      read: isLoggedIn,
      create: isLoggedIn,
      update: isLoggedIn,
      delete: isLoggedIn,
    },
    hooks: collectionCacheHooks({ drafts: false, tags: redirectTags }),
    fields: ({ defaultFields }) => withGuardrails(defaultFields),
  },
}
