import Link from 'next/link'
import type { ReactNode } from 'react'

import { ArrowIcon } from '@/components/icons/UiIcons'

import styles from './Button.module.css'

export type ButtonVariant = 'dark' | 'outline' | 'light'

interface CommonProps {
  variant?: ButtonVariant
  withArrow?: boolean
  /** Before the label, e.g. the download icon. */
  icon?: ReactNode
  ariaLabel?: string
  className?: string
  children: ReactNode
}

interface LinkButtonProps extends CommonProps {
  href: string
  /** A file or another app (PDF, tel:): a plain anchor, no client-side navigation or prefetch. */
  plain?: boolean
}

interface ActionButtonProps extends CommonProps {
  href?: undefined
  type?: 'button' | 'submit'
  onClick?: () => void
  /** Keeps the button focusable while it does nothing (a form that is still sending). */
  ariaDisabled?: boolean
}

export type ButtonProps = LinkButtonProps | ActionButtonProps

/** Class names of a pill, for components that render their own element (e.g. SubmitButton). */
export function buttonClassName(variant: ButtonVariant = 'dark', className?: string): string {
  return [styles.root, styles[variant], className ?? ''].filter(Boolean).join(' ')
}

/** Ink (default), outline or light pill. Renders a link with `href`, else a button. */
export function Button(props: ButtonProps) {
  const { variant = 'dark', withArrow = false, icon, ariaLabel, className, children } = props
  const classes = buttonClassName(variant, className)
  const content = (
    <>
      {icon}
      <span>{children}</span>
      {withArrow ? <ArrowIcon size={20} strokeWidth={2} className={styles.arrow} /> : null}
    </>
  )
  if (props.href !== undefined) {
    if (props.plain) {
      return (
        <a className={classes} href={props.href} aria-label={ariaLabel}>
          {content}
        </a>
      )
    }
    return (
      <Link className={classes} href={props.href} aria-label={ariaLabel}>
        {content}
      </Link>
    )
  }
  return (
    <button
      className={classes}
      type={props.type ?? 'button'}
      onClick={props.onClick}
      aria-label={ariaLabel}
      aria-disabled={props.ariaDisabled || undefined}
    >
      {content}
    </button>
  )
}
