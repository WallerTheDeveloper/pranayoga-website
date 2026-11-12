import { formatPrice } from '@/lib/format'
import type { PriceGroup } from '@/payload-types'

import type { PriceBadge, PriceBlockView, PriceGroupView, TrialOffer } from '../types'
import { asArray, asBoolean, cleanText, isPresent, rowId } from './values'

type PriceBlockDoc = NonNullable<PriceGroup['blocks']>[number]

function toBadge(value: unknown): PriceBadge | null {
  return value === 'popular' || value === 'promo' ? value : null
}

export function toPriceBlock(block: PriceBlockDoc, index: number): PriceBlockView | null {
  const name = cleanText(block.name)
  if (!name) return null
  const price = typeof block.price === 'number' && block.price >= 0 ? block.price : null
  return {
    id: rowId(block.id, index),
    name,
    badge: toBadge(block.badge),
    highlighted: asBoolean(block.highlighted),
    price,
    priceLabel: formatPrice(price),
    unit: cleanText(block.unit),
    inclusions: asArray(block.inclusions)
      .map((row) => cleanText(row.text))
      .filter(isPresent),
    action: block.action === 'whatsapp' ? 'whatsapp' : 'signup',
    isTrial: asBoolean(block.isTrial),
    showInSignupForm: asBoolean(block.showInSignupForm),
  }
}

export function toPriceGroup(doc: PriceGroup): PriceGroupView | null {
  const title = cleanText(doc.title)
  const blocks = asArray(doc.blocks)
    .map((block, index) => toPriceBlock(block, index))
    .filter(isPresent)
  if (!title || blocks.length === 0) return null
  return {
    id: String(doc.id),
    kicker: cleanText(doc.kicker) ?? '',
    title,
    description: cleanText(doc.description),
    blocks,
  }
}

/** The first block marked as the trial lesson (the admin allows at most one). */
export function findTrialOffer(groups: readonly PriceGroupView[]): TrialOffer | null {
  for (const group of groups) {
    const block = group.blocks.find((candidate) => candidate.isTrial)
    if (block) {
      return {
        name: block.name,
        price: block.price,
        priceLabel: block.priceLabel,
        unit: block.unit,
      }
    }
  }
  return null
}
