import type { ReactNode, SVGProps } from 'react'

export interface IconProps extends Omit<SVGProps<SVGSVGElement>, 'children'> {
  /** Rendered width and height in px. */
  size?: number
  strokeWidth?: number
}

interface IconBaseProps extends IconProps {
  /** Side length of the drawing grid (24 for UI icons, 48 for course icons). */
  grid: 24 | 48
  defaultStroke: number
  children: ReactNode
}

/**
 * Line icon on a square grid: round caps and joins, currentColor stroke.
 * Icons are decorative (aria-hidden); the visible word next to them carries the meaning.
 */
export function IconBase({
  grid,
  defaultStroke,
  size = 24,
  strokeWidth,
  children,
  ...rest
}: IconBaseProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${grid} ${grid}`}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth ?? defaultStroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {children}
    </svg>
  )
}
