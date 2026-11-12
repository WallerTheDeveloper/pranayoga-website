import type { CollectionSlug, Payload } from 'payload'

import { seedCourses, type SeedCourse, type SeedStep } from '../data/courses'
import { seedPriceGroups } from '../data/prices'
import { seedRedirects } from '../data/redirects'
import { seedReviews } from '../data/reviews'
import { mediaId, optionalMediaId, SEED_WRITE, type SeedContext } from './context'

const PUBLISH = { ...SEED_WRITE, draft: false } as const

/** Id of the first document whose `field` equals `value`, or undefined. */
async function findId(
  payload: Payload,
  collection: CollectionSlug,
  field: string,
  value: string,
): Promise<number | undefined> {
  const result = await payload.find({
    collection,
    where: { [field]: { equals: value } },
    depth: 0,
    limit: 1,
    pagination: false,
    overrideAccess: true,
  })
  const id = result.docs[0]?.id
  return typeof id === 'number' ? id : undefined
}

function stepItems(ctx: SeedContext, items: readonly SeedStep[]) {
  return items.map((item) => ({
    title: item.title,
    text: item.text,
    image: optionalMediaId(ctx, item.image),
  }))
}

function courseData(ctx: SeedContext, course: SeedCourse, order: number) {
  return {
    title: course.title,
    icon: course.icon,
    tagline: course.tagline,
    badge: course.badge ?? { text: null, tone: null },
    cardTeaser: course.cardTeaser,
    cardImage: mediaId(ctx, course.cardImage),
    hero: {
      eyebrow: course.hero.eyebrow,
      lead: course.hero.lead,
      audienceLabel: course.hero.audienceLabel,
      image: mediaId(ctx, course.hero.image),
      secondaryImage: optionalMediaId(ctx, course.hero.secondaryImage),
    },
    audience: {
      paragraphs: course.audience.paragraphs.map((text) => ({ text })),
      quote: course.audience.quote ?? null,
    },
    steps: { heading: course.steps.heading, items: stepItems(ctx, course.steps.items) },
    benefits: {
      heading: course.benefits.heading,
      items: stepItems(ctx, course.benefits.items),
      sideImage: optionalMediaId(ctx, course.benefits.sideImage),
    },
    schedule: [],
    faqs: course.faqs.map((faq) => ({ ...faq })),
    order,
    _status: 'published' as const,
  }
}

/** Upserts the six courses by slug; returns their ids by slug. */
export async function seedCourseDocs(ctx: SeedContext): Promise<Map<string, number>> {
  const ids = new Map<string, number>()
  for (const [index, course] of seedCourses.entries()) {
    const data = courseData(ctx, course, index + 1)
    const existingId = await findId(ctx.payload, 'courses', 'slug', course.slug)
    const doc =
      existingId === undefined
        ? await ctx.payload.create({
            collection: 'courses',
            data: { ...data, slug: course.slug },
            ...PUBLISH,
          })
        : await ctx.payload.update({ collection: 'courses', id: existingId, data, ...PUBLISH })
    ids.set(course.slug, doc.id)
  }
  ctx.payload.logger.info(`Courses: ${ids.size}`)
  return ids
}

/** Course id for a seed block's `courseSlug`; the slug must be one of the seeded courses. */
function linkedCourseId(courseIds: ReadonlyMap<string, number>, slug: string | undefined) {
  if (slug === undefined) return null
  const id = courseIds.get(slug)
  if (id === undefined) throw new Error(`Price block links to an unknown course: ${slug}`)
  return id
}

/** Upserts price groups by title. The trial group comes first, so the one-trial rule holds. */
export async function seedPriceGroupDocs(
  ctx: SeedContext,
  courseIds: ReadonlyMap<string, number>,
): Promise<void> {
  for (const [index, group] of seedPriceGroups.entries()) {
    const data = {
      kicker: group.kicker,
      title: group.title,
      description: group.description ?? null,
      blocks: group.blocks.map(({ courseSlug, ...block }) => ({
        ...block,
        inclusions: block.inclusions?.map((row) => ({ ...row })) ?? [],
        course: linkedCourseId(courseIds, courseSlug),
      })),
      order: index + 1,
      _status: 'published' as const,
    }
    const existingId = await findId(ctx.payload, 'price-groups', 'title', group.title)
    if (existingId === undefined) {
      await ctx.payload.create({ collection: 'price-groups', data, ...PUBLISH })
    } else {
      await ctx.payload.update({ collection: 'price-groups', id: existingId, data, ...PUBLISH })
    }
  }
  ctx.payload.logger.info(`Price groups: ${seedPriceGroups.length}`)
}

/** Upserts reviews by author. */
export async function seedReviewDocs(ctx: SeedContext): Promise<void> {
  for (const [index, review] of seedReviews.entries()) {
    const data = {
      author: review.author,
      text: review.text,
      source: 'Google-Bewertung',
      order: index + 1,
      _status: 'published' as const,
    }
    const existingId = await findId(ctx.payload, 'reviews', 'author', review.author)
    if (existingId === undefined) {
      await ctx.payload.create({ collection: 'reviews', data, ...PUBLISH })
    } else {
      await ctx.payload.update({ collection: 'reviews', id: existingId, data, ...PUBLISH })
    }
  }
  ctx.payload.logger.info(`Reviews: ${seedReviews.length}`)
}

/** Upserts the WordPress 301s by source path, pointing at the seeded courses. */
export async function seedRedirectDocs(
  ctx: SeedContext,
  courseIds: ReadonlyMap<string, number>,
): Promise<void> {
  for (const redirect of seedRedirects) {
    const courseId = courseIds.get(redirect.toCourseSlug)
    if (courseId === undefined)
      throw new Error(`Redirect target course missing: ${redirect.toCourseSlug}`)
    const data = {
      from: redirect.from,
      to: {
        type: 'reference' as const,
        reference: { relationTo: 'courses' as const, value: courseId },
      },
    }
    const existingId = await findId(ctx.payload, 'redirects', 'from', redirect.from)
    if (existingId === undefined) {
      await ctx.payload.create({ collection: 'redirects', data, ...SEED_WRITE })
    } else {
      await ctx.payload.update({ collection: 'redirects', id: existingId, data, ...SEED_WRITE })
    }
  }
  ctx.payload.logger.info(`Redirects: ${seedRedirects.length}`)
}

/** Every image file name the seed data points at, for the up-front manifest check. */
export function referencedCourseImages(): string[] {
  return seedCourses.flatMap((course) =>
    [
      course.cardImage,
      course.hero.image,
      course.hero.secondaryImage,
      course.benefits.sideImage,
      ...course.steps.items.map((item) => item.image),
      ...course.benefits.items.map((item) => item.image),
    ].filter((name): name is string => name !== undefined),
  )
}
