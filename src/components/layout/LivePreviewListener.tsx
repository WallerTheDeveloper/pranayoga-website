'use client'

import { RefreshRouteOnSave } from '@payloadcms/live-preview-react'
import { useRouter } from 'next/navigation'

interface LivePreviewListenerProps {
  serverURL: string
}

/** Rendered only in Draft Mode: re-renders the page whenever the editor saves in the admin. */
export function LivePreviewListener({ serverURL }: LivePreviewListenerProps) {
  const router = useRouter()
  return <RefreshRouteOnSave refresh={() => router.refresh()} serverURL={serverURL} />
}
