import type { ReactNode } from 'react'

import { ArrowIcon } from '@/components/icons/UiIcons'
import { Chip } from '@/components/ui/Chip'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { Heading } from '@/components/ui/Heading'
import type { AccentHeading } from '@/content/copy/home'
import { sharedCopy } from '@/content/copy/shared'
import { statusCopy } from '@/content/copy/status'
import { routes } from '@/lib/routes'

import styles from './StatusPage.module.css'

interface StatusPageProps {
  eyebrow: string
  heading: AccentHeading
  lead: string
  /** The big word in the breathing ring: "404" or "Prana". */
  mark: string
  /** Under the ways back: the booking block (404) or the reload link (errors). */
  children?: ReactNode
}

const WAYS_BACK = [
  { href: routes.home(), label: sharedCopy.breadcrumbs.home },
  { href: routes.courses(), label: sharedCopy.nav.courses },
  { href: routes.pricing(), label: sharedCopy.nav.pricing },
  { href: routes.contact(), label: sharedCopy.nav.contact },
] as const

/**
 * The 404 layout (Fehler-404.dc.html), shared by the error pages: what happened, four ways back,
 * and the breathing ring. No data access, so it renders even when the database is down.
 */
export function StatusPage({ eyebrow, heading, lead, mark, children }: StatusPageProps) {
  return (
    <section>
      <div className={styles.inner}>
        <div className={styles.grid}>
          <div className={styles.copy}>
            <Eyebrow className="in1">{eyebrow}</Eyebrow>
            <Heading as="h1" size="page" accent={heading.accent} accentTone="moss" className="in2">
              {heading.text}
            </Heading>
            <p className={`in3 ${styles.lead}`}>{lead}</p>
            <nav className={`in4 ${styles.ways}`} aria-label={statusCopy.linksLabel}>
              {WAYS_BACK.map((way) => (
                <Chip
                  key={way.href}
                  href={way.href}
                  icon={<ArrowIcon size={18} />}
                  iconPosition="end"
                  internal
                >
                  {way.label}
                </Chip>
              ))}
            </nav>
            {children ? <div className="in4">{children}</div> : null}
          </div>
          <div className={styles.markWrap} aria-hidden="true">
            <div className={`breath ${styles.ring}`} />
            <p className={`serif ${styles.mark}`}>{mark}</p>
          </div>
        </div>
      </div>
    </section>
  )
}
