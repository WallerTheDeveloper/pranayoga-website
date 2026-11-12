import { CourseIcon } from '@/components/icons/CourseIcons'
import type { CourseIconName } from '@/components/icons/courseIconNames'

import styles from './IconDisc.module.css'

interface IconDiscProps {
  icon: CourseIconName
  size?: 'large' | 'small'
}

/** Course icon on its disc: 72 px on cards (44 px icon), 48 px in the dropdown (30 px icon). */
export function IconDisc({ icon, size = 'large' }: IconDiscProps) {
  return (
    <span className={`${styles.root} ${styles[size]}`} data-disc="">
      <CourseIcon name={icon} size={size === 'large' ? 44 : 30} />
    </span>
  )
}
