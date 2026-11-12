import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'

import { getPayloadClient } from '@/content/source'
import { getServerEnv } from '@/lib/env'
import { isSafePreviewPath } from '@/lib/preview'
import { secretsMatch } from '@/lib/secrets'

/**
 * Entry point for Live Preview and preview links: checks the shared secret and the admin session,
 * turns on Draft Mode, then opens the page. Drafts are never shown without a logged-in admin.
 */
export async function GET(request: Request): Promise<Response> {
  const url = new URL(request.url)
  const path = url.searchParams.get('path')

  if (!secretsMatch(url.searchParams.get('secret'), getServerEnv().PREVIEW_SECRET)) {
    return new Response('Vorschau-Link ungültig.', { status: 401 })
  }
  if (!isSafePreviewPath(path)) {
    return new Response('Unbekannte Seite.', { status: 400 })
  }

  const payload = await getPayloadClient()
  const { user } = await payload.auth({ headers: request.headers })
  if (!user) {
    return new Response('Bitte zuerst im Admin-Bereich anmelden.', { status: 403 })
  }

  const draft = await draftMode()
  draft.enable()
  redirect(path)
}
