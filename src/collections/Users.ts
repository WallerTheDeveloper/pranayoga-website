import { APIError, type CollectionBeforeDeleteHook, type CollectionConfig } from 'payload'

import { hasUser, isLoggedIn } from '@/access'
import { ADMIN_GROUPS, label } from '@/fields/labels'
import { getServerEnv } from '@/lib/env'

function isHttpsSite(): boolean {
  return new URL(getServerEnv().NEXT_PUBLIC_SERVER_URL).protocol === 'https:'
}

/** The last remaining admin user can never be deleted, so nobody gets locked out. */
export const preventDeletingLastUser: CollectionBeforeDeleteHook = async ({ req }) => {
  const { totalDocs } = await req.payload.count({ collection: 'users', req, overrideAccess: true })
  if (totalDocs <= 1) {
    throw new APIError(
      'Der letzte Benutzer kann nicht gelöscht werden. Legen Sie zuerst einen weiteren an.',
      400,
      undefined,
      true,
    )
  }
}

export const Users: CollectionConfig = {
  slug: 'users',
  labels: {
    singular: label('Benutzer', 'User'),
    plural: label('Benutzer', 'Users'),
  },
  auth: {
    maxLoginAttempts: 5,
    lockTime: 10 * 60 * 1000,
    // Payload's default is not Secure: over HTTPS the session cookie must never go out over HTTP.
    cookies: {
      secure: isHttpsSite(),
      sameSite: 'Lax',
    },
  },
  admin: {
    useAsTitle: 'email',
    group: ADMIN_GROUPS.technical,
    description: label(
      'Technisch: Zugänge zum Admin-Bereich.',
      'Technical: accounts for the admin panel.',
    ),
  },
  access: {
    read: isLoggedIn,
    create: isLoggedIn,
    update: isLoggedIn,
    delete: isLoggedIn,
    admin: ({ req }) => hasUser(req),
  },
  hooks: {
    beforeDelete: [preventDeletingLastUser],
  },
  fields: [{ name: 'name', type: 'text', label: label('Name', 'Name'), maxLength: 80 }],
}
