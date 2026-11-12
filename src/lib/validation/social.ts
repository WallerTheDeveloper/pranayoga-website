export type SocialPlatform = 'instagram' | 'facebook'

const PLATFORM_HOSTS: Readonly<Record<SocialPlatform, readonly string[]>> = {
  instagram: ['instagram.com', 'www.instagram.com'],
  facebook: ['facebook.com', 'www.facebook.com', 'm.facebook.com'],
}

/** An https profile URL on the platform's own host. */
export function isAllowedSocialUrl(value: string, platform: SocialPlatform): boolean {
  try {
    const url = new URL(value)
    return url.protocol === 'https:' && PLATFORM_HOSTS[platform].includes(url.host)
  } catch {
    return false
  }
}
