import { CourseIcon } from '@/components/icons/CourseIcons'
import type { CourseIconName } from '@/components/icons/courseIconNames'

import styles from './IconDisc.module.css'

export type IconDiscSize = 'large' | 'medium' | 'small'

interface IconDiscProps {
  icon: CourseIconName
  size?: IconDiscSize
}

/** Icon size inside each disc: cards 72/44, course hero 64/40, dropdown 48/30. */
const ICON_SIZE: Readonly<Record<IconDiscSize, number>> = {
  large: 44,
  medium: 40,
  small: 30,
}

/** Course icon on its moss-light disc. */
export function IconDisc({ icon, size = 'large' }: IconDiscProps) {
  return (
    <span className={`${styles.root} ${styles[size]}`} data-disc="">
      <CourseIcon name={icon} size={ICON_SIZE[size]} />
    </span>
  )
}
