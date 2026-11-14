import { formatDate } from '@/lib/format'
import { hasOpenPlaceholder } from '@/lib/placeholders'
import type { LegalNotice, PrivacyPolicy } from '@/payload-types'

import type { LegalPageView, RichTextData } from '../types'

type LegalDoc = Pick<LegalNotice | PrivacyPolicy, 'updatedOn' | 'content'>

/** All the text inside a node, its children included. */
function textOf(node: unknown): string {
  if (typeof node !== 'object' || node === null) return ''
  const record = node as { text?: unknown; children?: unknown }
  const own = typeof record.text === 'string' ? record.text : ''
  const inner = Array.isArray(record.children) ? record.children.map(textOf).join('') : ''
  return own + inner
}

/**
 * The legal text without its unfinished blocks: a heading or paragraph that still holds a
 * "[…]" placeholder is left out, like every other admin text. Null when nothing with words is
 * left, so the page shows its "being revised" note instead of an empty column.
 */
export function publishableContent(content: RichTextData | null | undefined): RichTextData | null {
  if (!content?.root || !Array.isArray(content.root.children)) return null
  const children = content.root.children.filter((node) => !hasOpenPlaceholder(textOf(node)))
  if (!children.some((node) => textOf(node).trim().length > 0)) return null
  return { ...content, root: { ...content.root, children } }
}

export function toLegalPage(doc: LegalDoc): LegalPageView {
  return {
    updatedOnLabel: formatDate(doc.updatedOn),
    content: publishableContent(doc.content as RichTextData | null | undefined),
  }
}
