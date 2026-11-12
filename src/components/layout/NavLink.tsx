'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'

import { isCurrentPage, isCurrentSection } from '@/lib/routes'

interface NavLinkProps {
  href: string
  /** 'section' also marks pages below `href` (the "Kurse" link on a course page). */
  match?: 'page' | 'section'
  className?: string
  onClick?: () => void
  /** For a link that also opens a panel (the "Kurse" dropdown). */
  ariaExpanded?: boolean
  ariaControls?: string
  children: ReactNode
}

/**
 * Link with `aria-current`. Paths are compared in their public form, so the server render (at the
 * internal path) and the client render (at the German URL) agree.
 */
export function NavLink({
  href,
  match = 'page',
  className,
  onClick,
  ariaExpanded,
  ariaControls,
  children,
}: NavLinkProps) {
  const pathname = usePathname()
  const exact = isCurrentPage(pathname, href)
  const within = match === 'section' && !exact && isCurrentSection(pathname, href)
  const current = exact ? 'page' : within ? 'true' : undefined
  return (
    <Link
      href={href}
      className={className}
      aria-current={current}
      aria-expanded={ariaExpanded}
      aria-controls={ariaControls}
      onClick={onClick}
    >
      {children}
    </Link>
  )
}
