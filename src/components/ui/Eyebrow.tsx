import type { ReactNode } from 'react'

import styles from './Eyebrow.module.css'

interface EyebrowProps {
  onDark?: boolean
  className?: string
  children: ReactNode
}

export function Eyebrow({ onDark = false, className, children }: EyebrowProps) {
  const classes = [styles.root, onDark ? styles.onDark : '', className ?? '']
    .filter(Boolean)
    .join(' ')
  return <p className={classes}>{children}</p>
}
