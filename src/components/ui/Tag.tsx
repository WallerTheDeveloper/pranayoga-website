import type { ReactNode } from 'react'

import styles from './Tag.module.css'

interface TagProps {
  tone?: 'light' | 'dark'
  className?: string
  children: ReactNode
}

/** Light moss for audiences ("50 Plus"), dark ink for "Neu". */
export function Tag({ tone = 'light', className, children }: TagProps) {
  const classes = [styles.root, tone === 'dark' ? styles.dark : '', className ?? '']
    .filter(Boolean)
    .join(' ')
  return <span className={classes}>{children}</span>
}
