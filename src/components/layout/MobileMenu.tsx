'use client'

import { usePathname } from 'next/navigation'
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type MouseEvent,
  type ReactNode,
} from 'react'

import { CloseIcon, MenuIcon } from '@/components/icons/UiIcons'

import styles from './MobileMenu.module.css'

interface MobileMenuProps {
  buttonLabel: string
  dialogLabel: string
  closeLabel: string
  /** Logo link shown at the top of the open menu. */
  logo: ReactNode
  /** Server-rendered menu body: links, booking block, socials. */
  children: ReactNode
}

/** Full-screen menu below 1180 px. Closes on Escape, on the close button and on any link. */
export function MobileMenu({
  buttonLabel,
  dialogLabel,
  closeLabel,
  logo,
  children,
}: MobileMenuProps) {
  const dialogId = useId()
  const dialogRef = useRef<HTMLDialogElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  const close = useCallback(() => {
    const dialog = dialogRef.current
    if (dialog?.open) dialog.close()
  }, [])

  const openMenu = () => {
    const dialog = dialogRef.current
    if (!dialog || dialog.open) return
    dialog.showModal()
    setOpen(true)
  }

  // Navigating away (including the back button) closes the menu.
  useEffect(() => close(), [pathname, close])

  const handleClick = (event: MouseEvent<HTMLDialogElement>) => {
    if ((event.target as HTMLElement).closest('a')) close()
  }

  return (
    <>
      <button
        ref={buttonRef}
        className={styles.button}
        type="button"
        aria-expanded={open}
        aria-controls={dialogId}
        onClick={openMenu}
      >
        <MenuIcon size={22} strokeWidth={1.8} />
        <span>{buttonLabel}</span>
      </button>
      <dialog
        ref={dialogRef}
        id={dialogId}
        className={styles.dialog}
        aria-label={dialogLabel}
        onClose={() => {
          setOpen(false)
          buttonRef.current?.focus()
        }}
        onClick={handleClick}
      >
        <div className={styles.content}>
          <div className={styles.top}>
            {logo}
            <button className={styles.close} type="button" aria-label={closeLabel} onClick={close}>
              <CloseIcon size={22} strokeWidth={1.8} />
            </button>
          </div>
          {children}
        </div>
      </dialog>
    </>
  )
}
