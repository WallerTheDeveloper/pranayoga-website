'use client'

import { usePathname } from 'next/navigation'
import { ViewTransition, type ReactNode } from 'react'

/**
 * 240 ms crossfade between pages (motion.css). Keyed by path, so every navigation is an
 * exit/enter pair, even between two course pages that share a layout segment. The header and
 * footer sit outside, so they stay put. Browsers without View Transitions just swap the page.
 */
export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  return (
    <ViewTransition key={pathname} enter="page-enter" exit="page-exit" default="none">
      {children}
    </ViewTransition>
  )
}
