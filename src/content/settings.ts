import { CACHE_TAGS } from '@/cache/tags'
import { getServerEnv } from '@/lib/env'

import { toBusinessSettings, toReview, toTechnicalSettings } from './mappers/settings'
import { isPresent } from './mappers/values'
import { READ_OPTIONS, getPayloadClient, readContent } from './source'
import type { BusinessSettingsView, ReviewView, TechnicalSettingsView } from './types'

/** Contact data, WhatsApp, social and bank details: read by the layout on every page. */
export function getBusinessSettings(): Promise<BusinessSettingsView> {
  return readContent({
    key: ['business-settings'],
    tags: [CACHE_TAGS.businessSettings],
    load: async (mode) => {
      const payload = await getPayloadClient()
      const doc = await payload.findGlobal({
        slug: 'business-settings',
        ...READ_OPTIONS[mode],
        depth: 0,
      })
      return toBusinessSettings(doc)
    },
  })
}

export function getTechnicalSettings(): Promise<TechnicalSettingsView> {
  return readContent({
    key: ['technical-settings'],
    tags: [CACHE_TAGS.technicalSettings, CACHE_TAGS.media],
    load: async (mode) => {
      const payload = await getPayloadClient()
      const doc = await payload.findGlobal({
        slug: 'technical-settings',
        ...READ_OPTIONS[mode],
        depth: 1,
      })
      return toTechnicalSettings(doc, getServerEnv().NEXT_PUBLIC_SERVER_URL)
    },
  })
}

export function getReviews(): Promise<ReviewView[]> {
  return readContent({
    key: ['reviews'],
    tags: [CACHE_TAGS.reviews],
    load: async (mode) => {
      const payload = await getPayloadClient()
      const result = await payload.find({
        collection: 'reviews',
        ...READ_OPTIONS[mode],
        depth: 0,
        sort: 'order',
        limit: 50,
        pagination: false,
      })
      return result.docs.map(toReview).filter(isPresent)
    },
  })
}
