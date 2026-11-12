/**
 * The site has one trial lesson ("Probestunde"): its price fills the trial offer and the
 * `[Preis Probestunde]` token in course FAQs.
 *
 * Rule: at most one block across all published price groups is marked `isTrial`. "Exactly one" can't
 * be enforced per save, because moving the mark from one group to another would always pass
 * through zero or two. With none marked, the trial offer and token lines are hidden.
 */

export interface TrialBlockSource {
  isTrial?: boolean | null
}

export interface TrialGroupSource {
  title?: string | null
  blocks?: readonly TrialBlockSource[] | null
}

export function countTrialBlocks(blocks: readonly TrialBlockSource[] | null | undefined): number {
  return (blocks ?? []).filter((block) => block.isTrial === true).length
}

/**
 * Error message for publishing `currentBlocks` while `otherPublishedGroups` are live,
 * or null when the rule holds.
 */
export function trialRuleError(
  currentBlocks: readonly TrialBlockSource[] | null | undefined,
  otherPublishedGroups: readonly TrialGroupSource[],
): string | null {
  const own = countTrialBlocks(currentBlocks)
  if (own > 1) {
    return 'In dieser Gruppe ist mehr als ein Block als Probestunde markiert. Bitte nur einen markieren.'
  }
  if (own === 0) return null
  const holder = otherPublishedGroups.find((group) => countTrialBlocks(group.blocks) > 0)
  if (!holder) return null
  const where = holder.title ? `„${holder.title}“` : 'einer anderen Gruppe'
  return `Die Probestunde ist schon in ${where} markiert. Bitte dort zuerst den Haken entfernen.`
}
