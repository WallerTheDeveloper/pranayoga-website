'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useId, useRef, useState, type FocusEvent } from 'react'

import { useHydrated } from '@/components/hooks/useHydrated'
import { ChevronDownIcon } from '@/components/icons/UiIcons'
import { IconDisc } from '@/components/ui/IconDisc'
import { TextLink } from '@/components/ui/TextLink'
import type { CourseSummary } from '@/content/types'

import styles from './CoursesDropdown.module.css'
import { NavLink } from './NavLink'

interface CoursesDropdownProps {
  label: string
  href: string
  courses: readonly CourseSummary[]
  hint: string
  allCoursesLabel: string
  /** The header's `.navlink` class, so the trigger matches the other nav links. */
  triggerClassName?: string
}

/**
 * Opens on hover and on keyboard focus; Escape closes it and keeps focus on "Kurse". The 0.2 s
 * close delay lives in the CSS transition. Leaving with the pointer closes it unless focus is
 * inside.
 */
export function CoursesDropdown({
  label,
  href,
  courses,
  hint,
  allCoursesLabel,
  triggerClassName,
}: CoursesDropdownProps) {
  const panelId = useId()
  const rootRef = useRef<HTMLDivElement>(null)
  // Set while Escape moves focus back to the trigger, so that focus doesn't reopen the panel.
  const refocusingRef = useRef(false)
  const enhanced = useHydrated()
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const [openedOn, setOpenedOn] = useState(pathname)

  // A navigation (e.g. clicking a course) closes the panel.
  if (pathname !== openedOn) {
    setOpenedOn(pathname)
    setOpen(false)
  }

  // Escape closes the panel wherever focus is, so a panel opened by hover can be dismissed too
  // (WCAG 1.4.13). Focus goes back to "Kurse" only when it was inside the panel.
  useEffect(() => {
    if (!open) return
    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key !== 'Escape') return
      const root = rootRef.current
      setOpen(false)
      if (!root?.contains(document.activeElement)) return
      refocusingRef.current = true
      try {
        root.querySelector<HTMLAnchorElement>('a')?.focus()
      } finally {
        refocusingRef.current = false
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open])

  const handleBlur = (event: FocusEvent<HTMLDivElement>) => {
    if (!rootRef.current?.contains(event.relatedTarget as Node | null)) setOpen(false)
  }

  const handleFocus = () => {
    if (!refocusingRef.current) setOpen(true)
  }

  // The pointer leaving must not hide the panel under a keyboard user's focus. Focus from a
  // mouse click (not :focus-visible) doesn't count, or a click on "Kurse" would pin it open.
  const handleMouseLeave = () => {
    if (!rootRef.current?.querySelector(':focus-visible')) setOpen(false)
  }

  return (
    <div
      ref={rootRef}
      className={[styles.root, open ? styles.open : ''].filter(Boolean).join(' ')}
      data-enhanced={enhanced ? '' : undefined}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={handleMouseLeave}
      onFocus={handleFocus}
      onBlur={handleBlur}
    >
      <NavLink
        href={href}
        match="section"
        className={[triggerClassName ?? '', styles.trigger].filter(Boolean).join(' ')}
        ariaExpanded={enhanced ? open : undefined}
        ariaControls={panelId}
      >
        {label}
        <ChevronDownIcon size={16} strokeWidth={2} className={styles.chevron} />
      </NavLink>
      <div className={styles.panel} id={panelId}>
        <div className={styles.box}>
          <ul className={styles.list}>
            {courses.map((course) => (
              <li key={course.slug}>
                <NavLink href={course.href} className={styles.item}>
                  <IconDisc icon={course.icon} size="small" />
                  <span className={styles.itemText}>
                    <span className={`serif ${styles.itemTitle}`}>{course.title}</span>
                    {course.tagline ? (
                      <span className={styles.itemTagline}>{course.tagline}</span>
                    ) : null}
                  </span>
                </NavLink>
              </li>
            ))}
          </ul>
          <div className={styles.footer}>
            <span className={styles.hint}>{hint}</span>
            <TextLink href={href}>{allCoursesLabel}</TextLink>
          </div>
        </div>
      </div>
    </div>
  )
}
