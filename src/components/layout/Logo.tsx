import Image from 'next/image'
import Link from 'next/link'

import { routes } from '@/lib/routes'

/** Intrinsic sizes of the SVGs in public/brand. */
const LOGOS = {
  horizontal: { src: '/brand/logo-horizontal.svg', width: 577, height: 158 },
  stacked: { src: '/brand/logo-stacked.svg', width: 472, height: 288 },
} as const

interface LogoProps {
  variant?: keyof typeof LOGOS
  alt: string
  className?: string
  /** Header logo loads early (above the fold). */
  preload?: boolean
}

export function Logo({ variant = 'horizontal', alt, className, preload = false }: LogoProps) {
  const logo = LOGOS[variant]
  return (
    <Image
      src={logo.src}
      alt={alt}
      width={logo.width}
      height={logo.height}
      className={className}
      preload={preload}
      unoptimized
    />
  )
}

interface LogoLinkProps extends LogoProps {
  linkClassName?: string
}

export function LogoLink({ linkClassName, ...logo }: LogoLinkProps) {
  return (
    <Link className={linkClassName} href={routes.home()}>
      <Logo {...logo} />
    </Link>
  )
}
