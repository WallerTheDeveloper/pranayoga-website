/**
 * Admin texts may contain bracketed placeholders, the same convention as the design's dashed boxes.
 * Known tokens are filled from admin data; any bracket left open means "not filled in yet", and the
 * line is hidden on the live site instead of showing "[Monate]".
 */
export const TRIAL_PRICE_TOKEN = '[Preis Probestunde]'

const OPEN_PLACEHOLDER = /\[[^\]\n]+\]/

export interface PlaceholderValues {
  /** Formatted price of the trial block, or null when it has no price. */
  trialPrice: string | null
}

export function hasOpenPlaceholder(text: string): boolean {
  return OPEN_PLACEHOLDER.test(text)
}

/** Fills known tokens. Returns null when something is still open, so the caller can hide it. */
export function fillPlaceholders(text: string, values: PlaceholderValues): string | null {
  const filled =
    values.trialPrice === null ? text : text.split(TRIAL_PRICE_TOKEN).join(values.trialPrice)
  return hasOpenPlaceholder(filled) ? null : filled
}
