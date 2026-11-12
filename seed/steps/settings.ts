import { homeCopy } from '@/content/copy/home'
import { getServerEnv } from '@/lib/env'

import { seedBusinessSettings, seedTechnicalDefaults } from '../data/settings'
import { mediaId, SEED_WRITE, type SeedContext } from './context'

const PUBLISH = { ...SEED_WRITE, draft: false } as const

/** Publishes both globals. The site URL comes from the environment the seed runs in. */
export async function seedGlobals(ctx: SeedContext): Promise<void> {
  await ctx.payload.updateGlobal({
    slug: 'business-settings',
    data: { ...seedBusinessSettings, _status: 'published' },
    ...PUBLISH,
  })

  await ctx.payload.updateGlobal({
    slug: 'technical-settings',
    data: {
      siteUrl: getServerEnv().NEXT_PUBLIC_SERVER_URL,
      noindex: seedTechnicalDefaults.noindex,
      defaultSeo: {
        title: seedTechnicalDefaults.defaultSeoTitle,
        description: homeCopy.meta.description,
        image: mediaId(ctx, seedTechnicalDefaults.defaultSeoImage),
      },
      featureFlags: { ...seedTechnicalDefaults.featureFlags },
      _status: 'published',
    },
    ...PUBLISH,
  })
  ctx.payload.logger.info('Globals: business-settings, technical-settings')
}
