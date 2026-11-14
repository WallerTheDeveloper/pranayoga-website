import type { Metadata } from 'next'
import { notFound, permanentRedirect } from 'next/navigation'

import { findRedirect } from '@/content'

interface UnknownPathProps {
  params: Promise<{ path: string[] }>
}

/**
 * Any URL no page claims. Old WordPress addresses move on to their new page (308, permanent);
 * everything else gets the 404 page inside the site layout. Rendered per request, so random URLs
 * never fill the page cache; the redirect table itself is one cached read.
 */
export const dynamic = 'force-dynamic'

async function leave({ params }: UnknownPathProps): Promise<never> {
  const { path } = await params
  const target = await findRedirect(`/${path.join('/')}/`)
  if (target) permanentRedirect(target)
  notFound()
}

/** Thrown here as well as in the page: otherwise the client swaps the 404 title for the default. */
export async function generateMetadata(props: UnknownPathProps): Promise<Metadata> {
  return leave(props)
}

export default async function UnknownPath(props: UnknownPathProps) {
  return leave(props)
}
