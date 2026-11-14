import { CACHE_TAGS } from '@/cache/tags'

import { toLegalPage } from './mappers/legal'
import { READ_OPTIONS, getPayloadClient, readContent } from './source'
import type { LegalPageView } from './types'

export type LegalPageSlug = 'legal-notice' | 'privacy-policy'

const LEGAL_TAGS: Readonly<Record<LegalPageSlug, string>> = {
  'legal-notice': CACHE_TAGS.legalNotice,
  'privacy-policy': CACHE_TAGS.privacyPolicy,
}

/** Impressum or Datenschutz: the "Stand" date and the rich text. */
export function getLegalPage(slug: LegalPageSlug): Promise<LegalPageView> {
  return readContent({
    key: [slug],
    tags: [LEGAL_TAGS[slug]],
    load: async (mode) => {
      const payload = await getPayloadClient()
      const doc = await payload.findGlobal({ slug, ...READ_OPTIONS[mode], depth: 0 })
      return toLegalPage(doc)
    },
  })
}
