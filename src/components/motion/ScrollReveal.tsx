'use client'

import { usePathname } from 'next/navigation'
import { useLayoutEffect } from 'react'

/** Siblings that enter together start 80 ms apart, at most four steps (Main.dc.html §06). */
export const REVEAL_STAGGER_MS = 80
export const REVEAL_MAX_STEPS = 4
const ACTIVE_CLASS = 'rv-on'
const TARGET_SELECTOR = '.rv:not(.in)'

function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function pageScrolls(): boolean {
  return document.documentElement.scrollHeight > window.innerHeight + 1
}

function inViewport(element: Element): boolean {
  const rect = element.getBoundingClientRect()
  return rect.top < window.innerHeight && rect.bottom > 0
}

/** The delay of the n-th element in one batch: 0, 80, 160, 240, 240 … ms. */
export function revealDelay(index: number): string {
  return `${Math.min(index, REVEAL_MAX_STEPS - 1) * REVEAL_STAGGER_MS}ms`
}

/**
 * Fades `.rv` blocks in as they enter the screen, once. Blocks already on screen, every block on
 * a page that does not scroll, and everything under reduced motion are never hidden. Without
 * JavaScript nothing is hidden either, because only this component switches the effect on.
 */
export function ScrollReveal() {
  const pathname = usePathname()

  useLayoutEffect(() => {
    const root = document.documentElement
    // Measure with the effect off, so nothing on screen is ever hidden, not even for a frame.
    root.classList.remove(ACTIVE_CLASS)
    if (prefersReducedMotion() || typeof IntersectionObserver === 'undefined') return

    const targets = Array.from(document.querySelectorAll<HTMLElement>(TARGET_SELECTOR))
    if (targets.length === 0) return
    if (!pageScrolls()) {
      targets.forEach((target) => target.classList.add('in'))
      return
    }

    const waiting = targets.filter((target) => {
      if (!inViewport(target)) return true
      target.classList.add('in')
      return false
    })
    root.classList.add(ACTIVE_CLASS)

    const observer = new IntersectionObserver(
      (entries) => {
        entries
          .filter((entry) => entry.isIntersecting)
          .forEach((entry, index) => {
            const target = entry.target as HTMLElement
            target.style.setProperty('--rv-delay', revealDelay(index))
            target.classList.add('in')
            observer.unobserve(target)
          })
      },
      { rootMargin: '0px 0px -8% 0px' },
    )
    waiting.forEach((target) => observer.observe(target))
    return () => observer.disconnect()
  }, [pathname])

  return null
}
