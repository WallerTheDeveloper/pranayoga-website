'use client'

import '@/styles/tokens.css'
import '@/styles/base.css'
import '@/styles/motion.css'

import { atkinson, fraunces } from '@/app/(site)/fonts'
import { ReloadLink } from '@/components/status/ReloadLink'
import { StatusPage } from '@/components/status/StatusPage'
import { sharedCopy } from '@/content/copy/shared'
import { statusCopy } from '@/content/copy/status'

/**
 * The root layout itself failed (the header and footer need the database), so this page brings
 * its own document, fonts and styles, and reads nothing from the admin.
 */
export default function GlobalError() {
  const copy = statusCopy.error
  return (
    <html lang="de" className={`${fraunces.variable} ${atkinson.variable}`}>
      <body>
        <title>{`${copy.heading.text} ${copy.heading.accent} · ${sharedCopy.brand.name}`}</title>
        <div className="page paper">
          <main>
            <StatusPage
              eyebrow={copy.eyebrow}
              heading={copy.heading}
              lead={copy.lead}
              mark={copy.mark}
            >
              <ReloadLink />
            </StatusPage>
          </main>
        </div>
      </body>
    </html>
  )
}
