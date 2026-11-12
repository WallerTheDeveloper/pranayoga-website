import { ArrowIcon, WhatsAppIcon } from '@/components/icons/UiIcons'

import styles from './WhatsAppButton.module.css'

export type WhatsAppButtonSize = 'regular' | 'small' | 'bar'

interface WhatsAppButtonProps {
  href: string
  label: string
  /** Full sentence for screen readers, e.g. "Termin über WhatsApp (öffnet WhatsApp)". */
  ariaLabel: string
  size?: WhatsAppButtonSize
  withArrow?: boolean
  className?: string
}

const ICON_SIZE: Readonly<Record<WhatsAppButtonSize, number>> = {
  regular: 26,
  small: 22,
  bar: 24,
}

/** The one terracotta button on the site: always opens WhatsApp. */
export function WhatsAppButton({
  href,
  label,
  ariaLabel,
  size = 'regular',
  withArrow = false,
  className,
}: WhatsAppButtonProps) {
  const classes = [
    styles.root,
    size === 'small' ? styles.small : '',
    size === 'bar' ? styles.bar : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ')
  return (
    <a
      className={classes}
      href={href}
      aria-label={ariaLabel}
      rel="noopener noreferrer"
      target="_blank"
    >
      <WhatsAppIcon size={ICON_SIZE[size]} color="#ffffff" />
      <span>{label}</span>
      {withArrow ? <ArrowIcon size={20} strokeWidth={2} className={styles.arrow} /> : null}
    </a>
  )
}
