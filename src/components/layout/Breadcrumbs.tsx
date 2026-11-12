import Link from 'next/link'

import { sharedCopy } from '@/content/copy/shared'
import { routes } from '@/lib/routes'

import styles from './Breadcrumbs.module.css'

export interface Crumb {
  label: string
  /** Omitted for the current page, the last crumb. */
  href?: string
}

interface BreadcrumbsProps {
  /** Trail after "Startseite", ending with the current page. */
  items: readonly Crumb[]
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  const trail: Crumb[] = [{ label: sharedCopy.breadcrumbs.home, href: routes.home() }, ...items]
  return (
    <nav aria-label={sharedCopy.breadcrumbs.label}>
      <ol className={styles.list}>
        {trail.map((crumb, index) => {
          const isLast = index === trail.length - 1
          return (
            <li key={`${crumb.label}-${index}`} className={styles.item}>
              {crumb.href && !isLast ? (
                <Link className={styles.link} href={crumb.href}>
                  {crumb.label}
                </Link>
              ) : (
                <span aria-current={isLast ? 'page' : undefined}>{crumb.label}</span>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
