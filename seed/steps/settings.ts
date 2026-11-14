import { homeCopy } from '@/content/copy/home'
import { getServerEnv } from '@/lib/env'

import { seedLegalNotice, seedPrivacyPolicy } from '../data/legal'
import { seedBusinessSettings, seedTechnicalDefaults } from '../data/settings'
import { SEED_FLYER_IMAGE, seedTeacherTraining } from '../data/teacherTraining'
import { mediaId, SEED_WRITE, type SeedContext } from './context'

const PUBLISH = { ...SEED_WRITE, draft: false } as const

/** Publishes the globals. The site URL comes from the environment the seed runs in. */
export async function seedGlobals(ctx: SeedContext): Promise<void> {
  await ctx.payload.updateGlobal({
    slug: 'business-settings',
    data: { ...seedBusinessSettings, _status: 'published' },
    ...PUBLISH,
  })

  await ctx.payload.updateGlobal({
    slug: 'teacher-training',
    data: {
      ...seedTeacherTraining,
      weekends: [],
      topics: seedTeacherTraining.topics?.map((topic) => ({ ...topic })) ?? [],
      requirements: seedTeacherTraining.requirements?.map((row) => ({ ...row })) ?? [],
      flyer: { image: mediaId(ctx, SEED_FLYER_IMAGE) },
      teaser: {
        ...seedTeacherTraining.teaser,
        facts: seedTeacherTraining.teaser.facts?.map((fact) => ({ ...fact })) ?? [],
      },
      _status: 'published',
    },
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
  for (const [slug, content] of [
    ['legal-notice', seedLegalNotice],
    ['privacy-policy', seedPrivacyPolicy],
  ] as const) {
    await ctx.payload.updateGlobal({
      slug,
      data: { updatedOn: null, content, _status: 'published' },
      ...PUBLISH,
    })
  }
  ctx.payload.logger.info(
    'Globals: business-settings, teacher-training, legal-notice, privacy-policy, technical-settings',
  )
}
