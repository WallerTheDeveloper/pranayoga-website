import Link from 'next/link'
import type { ReactNode } from 'react'

import { ArrowIcon } from '@/components/icons/UiIcons'

import styles from './Button.module.css'

export type ButtonVariant = 'dark' | 'outline' | 'light'

interface CommonProps {
  variant?: ButtonVariant
  withArrow?: boolean
  className?: string
  children: ReactNode
}

interface LinkButtonProps extends CommonProps {
  href: string
}

interface ActionButtonProps extends CommonProps {
  href?: undefined
  type?: 'button' | 'submit'
  onClick?: () => void
}

export type ButtonProps = LinkButtonProps | ActionButtonProps

/** Ink (default), outline or light pill. Renders a link with `href`, else a button. */
export function Button(props: ButtonProps) {
  const { variant = 'dark', withArrow = false, className, children } = props
  const classes = [styles.root, styles[variant], className ?? ''].filter(Boolean).join(' ')
  const content = (
    <>
      <span>{children}</span>
      {withArrow ? <ArrowIcon size={20} strokeWidth={2} className={styles.arrow} /> : null}
    </>
  )
  if (props.href !== undefined) {
    return (
      <Link className={classes} href={props.href}>
        {content}
      </Link>
    )
  }
  return (
    <button className={classes} type={props.type ?? 'button'} onClick={props.onClick}>
      {content}
    </button>
  )
}
