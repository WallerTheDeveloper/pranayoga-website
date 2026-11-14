'use client'

import { ReloadLink } from '@/components/status/ReloadLink'
import { StatusPage } from '@/components/status/StatusPage'
import { statusCopy } from '@/content/copy/status'

/**
 * A page failed to render (e.g. the database is unreachable): the 404 layout with "Etwas ist
 * schiefgelaufen" and a reload link. Uses no admin data, so it cannot fail the same way.
 */
export default function SiteError() {
  const copy = statusCopy.error
  return (
    <StatusPage eyebrow={copy.eyebrow} heading={copy.heading} lead={copy.lead} mark={copy.mark}>
      <ReloadLink />
    </StatusPage>
  )
}
