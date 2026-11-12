import { CACHE_TAGS } from '@/cache/tags'

import { findTrialOffer, toPriceGroup } from './mappers/prices'
import { isPresent } from './mappers/values'
import { READ_OPTIONS, getPayloadClient, readContent } from './source'
import type { PriceGroupView, TrialOffer } from './types'

export function getPriceGroups(): Promise<PriceGroupView[]> {
  return readContent({
    key: ['price-groups'],
    tags: [CACHE_TAGS.priceGroups],
    load: async (mode) => {
      const payload = await getPayloadClient()
      const result = await payload.find({
        collection: 'price-groups',
        ...READ_OPTIONS[mode],
        depth: 0,
        sort: 'order',
        limit: 20,
        pagination: false,
      })
      return result.docs.map(toPriceGroup).filter(isPresent)
    },
  })
}

/** The trial lesson ("Probestunde"), or null when no block is marked as the trial. */
export async function getTrialOffer(): Promise<TrialOffer | null> {
  return findTrialOffer(await getPriceGroups())
}
