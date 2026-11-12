import { FacebookIcon, InstagramIcon } from '@/components/icons/UiIcons'
import { sharedCopy } from '@/content/copy/shared'

import styles from './SocialButton.module.css'

export type SocialPlatform = 'instagram' | 'facebook'

interface SocialButtonProps {
  platform: SocialPlatform
  href: string
  size?: 'regular' | 'small'
}

const COPY = {
  instagram: {
    label: sharedCopy.social.instagram,
    ariaLabel: sharedCopy.social.instagramAriaLabel,
    Icon: InstagramIcon,
  },
  facebook: {
    label: sharedCopy.social.facebook,
    ariaLabel: sharedCopy.social.facebookAriaLabel,
    Icon: FacebookIcon,
  },
} as const

/** Shown only when the admin has entered the profile URL (the caller checks). */
export function SocialButton({ platform, href, size = 'regular' }: SocialButtonProps) {
  const { label, ariaLabel, Icon } = COPY[platform]
  const classes = [styles.root, size === 'small' ? styles.small : ''].filter(Boolean).join(' ')
  return (
    <a
      className={classes}
      href={href}
      aria-label={ariaLabel}
      target="_blank"
      rel="noopener noreferrer"
    >
      <Icon size={size === 'small' ? 18 : 20} />
      <span>{label}</span>
    </a>
  )
}
