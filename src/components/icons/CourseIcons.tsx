import type { ComponentType } from 'react'

import type { CourseIconName } from './courseIconNames'
import { IconBase, type IconProps } from './Icon'

/* One 48 px grid, 1.75 px stroke, round ends (Main.dc.html §05). */

/** Ha + Tha: sun and moon. */
export function HathaIcon(props: IconProps) {
  return (
    <IconBase grid={48} defaultStroke={1.75} {...props}>
      <circle cx="24" cy="24" r="9" />
      <path d="M24 15A4.5 9 0 0 0 24 33" />
      <path d="M36.5 24H40M34.8 17.8l3.1-1.8M30.3 13.2L32 10.1M34.8 30.3l3.1 1.8M30.3 34.8L32 37.9" />
    </IconBase>
  )
}

/** A gently curved spine. */
export function BackIcon(props: IconProps) {
  return (
    <IconBase grid={48} defaultStroke={1.75} {...props}>
      <rect x="19.4" y="6.7" width="8" height="4.6" rx="2.3" transform="rotate(6 23.4 9)" />
      <rect x="20.05" y="14.2" width="9.5" height="4.6" rx="2.3" transform="rotate(8 24.8 16.5)" />
      <rect x="20.1" y="21.7" width="11" height="4.6" rx="2.3" />
      <rect
        x="18.55"
        y="29.2"
        width="12.5"
        height="4.6"
        rx="2.3"
        transform="rotate(-8 24.8 31.5)"
      />
      <rect x="16.2" y="36.7" width="14" height="4.6" rx="2.3" transform="rotate(-4 23.2 39)" />
    </IconBase>
  )
}

/** Bowl and sound. */
export function SingingBowlIcon(props: IconProps) {
  return (
    <IconBase grid={48} defaultStroke={1.75} {...props}>
      <path d="M10 25H38C38 33 31.7 38 24 38S10 33 10 25Z" />
      <path d="M19 41.5H29" />
      <path d="M17 19.5C20.5 17 27.5 17 31 19.5" />
      <path d="M13 14C19 9.5 29 9.5 35 14" />
    </IconBase>
  )
}

/** A sprout: growing. */
export function TeensIcon(props: IconProps) {
  return (
    <IconBase grid={48} defaultStroke={1.75} {...props}>
      <path d="M24 41V23" />
      <path d="M24 29C24 23.5 19.5 19.5 13.5 19.5C13.5 25 18 29 24 29Z" />
      <path d="M24 23C24 16 28.5 11 35.5 11C35.5 18 30.5 23 24 23Z" />
      <path d="M15 41H33" />
    </IconBase>
  )
}

/** The yoga wheel. */
export function WheelIcon(props: IconProps) {
  return (
    <IconBase grid={48} defaultStroke={1.75} {...props}>
      <circle cx="24" cy="23" r="14" />
      <circle cx="24" cy="23" r="9.5" />
      <path d="M8 38H40" />
    </IconBase>
  )
}

/** A stone stack: strength and balance. */
export function SportBalanceIcon(props: IconProps) {
  return (
    <IconBase grid={48} defaultStroke={1.75} {...props}>
      <ellipse cx="24" cy="36.5" rx="12" ry="4.5" />
      <ellipse cx="24" cy="27.6" rx="8.5" ry="3.8" />
      <ellipse cx="24.6" cy="20" rx="5.6" ry="3.2" />
      <circle cx="24.4" cy="13.6" r="2.4" />
    </IconBase>
  )
}

export const courseIcons: Readonly<Record<CourseIconName, ComponentType<IconProps>>> = {
  hatha: HathaIcon,
  back: BackIcon,
  singingBowl: SingingBowlIcon,
  teens: TeensIcon,
  wheel: WheelIcon,
  sportBalance: SportBalanceIcon,
}

interface CourseIconProps extends IconProps {
  name: CourseIconName
}

export function CourseIcon({ name, ...props }: CourseIconProps) {
  const Component = courseIcons[name]
  return <Component {...props} />
}
