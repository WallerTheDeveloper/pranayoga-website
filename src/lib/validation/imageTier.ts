/**
 * Photo size tiers (Main.dc.html §04). An image must be at least as large as the tier's display
 * width on its shorter side, so it never renders blurry.
 */
export type ImageTier = 'feature' | 'card' | 'small'

export const IMAGE_TIER_MIN_SHORT_SIDE: Readonly<Record<ImageTier, number>> = {
  feature: 600,
  card: 440,
  small: 330,
}

export const IMAGE_TIER_LABELS: Readonly<Record<ImageTier, { de: string; en: string }>> = {
  feature: { de: 'Titelbild', en: 'Feature image' },
  card: { de: 'Kartenbild', en: 'Card image' },
  small: { de: 'Kleines Bild', en: 'Small image' },
}

export interface ImageDimensions {
  width?: number | null
  height?: number | null
}

export function meetsImageTier(dimensions: ImageDimensions, tier: ImageTier): boolean {
  const { width, height } = dimensions
  if (typeof width !== 'number' || typeof height !== 'number') return false
  return Math.min(width, height) >= IMAGE_TIER_MIN_SHORT_SIDE[tier]
}
