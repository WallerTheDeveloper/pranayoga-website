import { IconBase, type IconProps } from './Icon'

/* UI icons on a 24 px grid, taken from the design markup. */

export function ArrowIcon(props: IconProps) {
  return (
    <IconBase grid={24} defaultStroke={2} {...props}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </IconBase>
  )
}

/** Diagonal arrow for links that leave the site. */
export function ExternalArrowIcon(props: IconProps) {
  return (
    <IconBase grid={24} defaultStroke={2} {...props}>
      <path d="M7 17L17 7M9 7h8v8" />
    </IconBase>
  )
}

export function ChevronDownIcon(props: IconProps) {
  return (
    <IconBase grid={24} defaultStroke={2} {...props}>
      <path d="M6 9l6 6 6-6" />
    </IconBase>
  )
}

export function PhoneIcon(props: IconProps) {
  return (
    <IconBase grid={24} defaultStroke={1.75} {...props}>
      <path d="M6.6 3.5h2.6l1.4 4-2 1.3a11 11 0 0 0 5.6 5.6l1.3-2 4 1.4v2.6a2 2 0 0 1-2.2 2A16 16 0 0 1 4.6 5.7a2 2 0 0 1 2-2.2z" />
    </IconBase>
  )
}

export function MailIcon(props: IconProps) {
  return (
    <IconBase grid={24} defaultStroke={1.75} {...props}>
      <rect x="3" y="5.5" width="18" height="13" rx="2" />
      <path d="M3.5 7l8.5 6 8.5-6" />
    </IconBase>
  )
}

export function MapPinIcon(props: IconProps) {
  return (
    <IconBase grid={24} defaultStroke={1.75} {...props}>
      <path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11z" />
      <circle cx="12" cy="10" r="2.3" />
    </IconBase>
  )
}

export function MenuIcon(props: IconProps) {
  return (
    <IconBase grid={24} defaultStroke={1.8} {...props}>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </IconBase>
  )
}

export function CloseIcon(props: IconProps) {
  return (
    <IconBase grid={24} defaultStroke={1.8} {...props}>
      <path d="M6 6l12 12M18 6L6 18" />
    </IconBase>
  )
}

export function InstagramIcon(props: IconProps) {
  return (
    <IconBase grid={24} defaultStroke={1.75} {...props}>
      <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r=".6" fill="currentColor" />
    </IconBase>
  )
}

export function FacebookIcon(props: IconProps) {
  return (
    <IconBase grid={24} defaultStroke={1.75} {...props}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12.6 20.5V11c0-1.7.9-2.6 2.6-2.6h1.3M9.6 13.2h5.6" />
    </IconBase>
  )
}

/** Rosette with a tick: the Yogaausbildungen pill. */
export function CertificateIcon(props: IconProps) {
  return (
    <IconBase grid={24} defaultStroke={1.8} {...props}>
      <circle cx="12" cy="9.5" r="5.5" />
      <path d="M9 14.2L7.5 21l4.5-2.4 4.5 2.4-1.5-6.8" />
      <path d="M10 9.5l1.5 1.5 2.7-2.8" />
    </IconBase>
  )
}

/** Plus sign: "Vergrößern" on certificates and the FAQ toggle. */
export function PlusIcon(props: IconProps) {
  return (
    <IconBase grid={24} defaultStroke={2} {...props}>
      <path d="M12 5v14M5 12h14" />
    </IconBase>
  )
}

/** Alias kept for the lightbox trigger (phase 3). */
export const ZoomIcon = PlusIcon

/** Circled "i": the medical note on the course pages. */
export function InfoIcon(props: IconProps) {
  return (
    <IconBase grid={24} defaultStroke={1.75} {...props}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 11v5M12 8v.01" />
    </IconBase>
  )
}

/** Clock: "Kurszeiten und freie Plätze" on the course overview. */
export function ClockIcon(props: IconProps) {
  return (
    <IconBase grid={24} defaultStroke={1.75} {...props}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </IconBase>
  )
}

export function CheckIcon(props: IconProps) {
  return (
    <IconBase grid={24} defaultStroke={2.2} {...props}>
      <path d="M5 12.5l4.5 4.5L19 7.5" />
    </IconBase>
  )
}

interface WhatsAppIconProps {
  size?: number
  /** Glyph colour; white on the terracotta button. */
  color?: string
  className?: string
}

/** WhatsApp glyph: outlined bubble with a filled handset. */
export function WhatsAppIcon({ size = 26, color = 'currentColor', className }: WhatsAppIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <path
        d="M12 3.2a8.8 8.8 0 0 0-7.6 13.2L3.2 20.8l4.5-1.2A8.8 8.8 0 1 0 12 3.2z"
        fill="none"
        stroke={color}
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M8.9 8.3c-.3.9-.1 2.2.9 3.7 1.1 1.6 2.7 2.9 4.2 3.4 1 .3 1.8.1 2.3-.5l.4-.6c.1-.2 0-.5-.2-.6l-1.7-.8c-.2-.1-.4 0-.5.1l-.6.7c-.1.2-.4.2-.6.1-1-.5-1.9-1.4-2.4-2.4-.1-.2-.1-.4.1-.6l.6-.6c.1-.1.2-.3.1-.5l-.7-1.7c-.1-.3-.4-.4-.6-.3l-.7.3c-.3.1-.5.3-.6.6z"
        fill={color}
      />
    </svg>
  )
}

interface QuoteMarkProps {
  color: string
  className?: string
}

/** Large opening quote used on review cards and the teacher quote. */
export function QuoteMark({ color, className }: QuoteMarkProps) {
  return (
    <svg
      width="30"
      height="25"
      viewBox="0 0 36 30"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <path
        d="M0 30V18C0 8 5 2 14 0l1.6 3.4C10.4 5.4 8 9 8 14h7v16H0zm20 0V18c0-10 5-16 14-18l1.6 3.4C30.4 5.4 28 9 28 14h7v16H20z"
        fill={color}
      />
    </svg>
  )
}
