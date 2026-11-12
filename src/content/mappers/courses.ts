import { isCourseIconName } from '@/components/icons/courseIconNames'
import { WEEKDAYS, WEEKDAY_LABELS, formatTimeRange, type Weekday } from '@/lib/format'
import { fillPlaceholders } from '@/lib/placeholders'
import { isValidSlug, routes } from '@/lib/routes'
import { compareTimes, isValidTime } from '@/lib/validation/time'
import type { Course } from '@/payload-types'

import type {
  CourseBadge,
  CourseDetail,
  CourseStep,
  CourseSummary,
  FaqEntry,
  ScheduleEntry,
  SeoData,
} from '../types'
import { toImage } from './media'
import { asArray, cleanText, isPresent, rawText } from './values'

function toBadge(badge: Course['badge']): CourseBadge | null {
  const text = cleanText(badge?.text)
  if (!text) return null
  return { text, tone: badge?.tone === 'dark' ? 'dark' : 'light' }
}

/** Null when the course lacks what a card needs (title, valid slug, icon). */
export function toCourseSummary(doc: Course): CourseSummary | null {
  const title = cleanText(doc.title)
  const slug = typeof doc.slug === 'string' && isValidSlug(doc.slug) ? doc.slug : null
  if (!title || !slug || !isCourseIconName(doc.icon)) return null
  return {
    slug,
    href: routes.course(slug),
    title,
    icon: doc.icon,
    tagline: cleanText(doc.tagline) ?? '',
    badge: toBadge(doc.badge),
    cardTeaser: cleanText(doc.cardTeaser) ?? '',
    cardImage: toImage(doc.cardImage, 'card'),
  }
}

function toSteps(items: NonNullable<Course['steps']['items']> | null | undefined): CourseStep[] {
  return asArray(items)
    .map((item) => {
      const title = cleanText(item.title)
      const text = cleanText(item.text)
      return title && text ? { title, text, image: toImage(item.image, 'card') } : null
    })
    .filter(isPresent)
}

function isWeekday(value: unknown): value is Weekday {
  return typeof value === 'string' && (WEEKDAYS as readonly string[]).includes(value)
}

/** Valid rows only, sorted Monday → Sunday, then by start time. */
export function toSchedule(rows: Course['schedule']): ScheduleEntry[] {
  return asArray(rows)
    .filter((row) => isWeekday(row.weekday) && isValidTime(row.start))
    .map((row) => ({
      weekday: row.weekday,
      start: row.start,
      end: typeof row.end === 'string' && isValidTime(row.end) ? row.end : null,
    }))
    .sort(
      (a, b) =>
        WEEKDAYS.indexOf(a.weekday) - WEEKDAYS.indexOf(b.weekday) || compareTimes(a.start, b.start),
    )
    .map((row) => ({
      weekday: row.weekday,
      weekdayLabel: WEEKDAY_LABELS[row.weekday],
      timeLabel: formatTimeRange(row.start, row.end),
    }))
}

/** FAQ answers may use `[Preis Probestunde]`; an entry with anything still open is hidden. */
export function toFaqs(rows: Course['faqs'], trialPriceLabel: string | null): FaqEntry[] {
  return asArray(rows)
    .map((row) => {
      const question = cleanText(row.question)
      const answerSource = rawText(row.answer)
      const answer = answerSource
        ? fillPlaceholders(answerSource, { trialPrice: trialPriceLabel })
        : null
      return question && answer ? { question, answer } : null
    })
    .filter(isPresent)
}

export function toSeo(seo: Course['seo'] | null | undefined): SeoData {
  return {
    title: cleanText(seo?.title),
    description: cleanText(seo?.description),
    image: toImage(seo?.image, 'card'),
  }
}

export interface CourseDetailContext {
  trialPriceLabel: string | null
}

export function toCourseDetail(doc: Course, context: CourseDetailContext): CourseDetail | null {
  const summary = toCourseSummary(doc)
  if (!summary) return null
  return {
    ...summary,
    hero: {
      eyebrow: cleanText(doc.hero?.eyebrow),
      lead: cleanText(doc.hero?.lead) ?? '',
      audienceLabel: cleanText(doc.hero?.audienceLabel),
      image: toImage(doc.hero?.image, 'feature'),
      secondaryImage: toImage(doc.hero?.secondaryImage, 'card'),
    },
    audience: {
      heading: cleanText(doc.audience?.heading),
      paragraphs: asArray(doc.audience?.paragraphs)
        .map((row) => cleanText(row.text))
        .filter(isPresent),
      quote: cleanText(doc.audience?.quote),
    },
    steps: { heading: cleanText(doc.steps?.heading), items: toSteps(doc.steps?.items) },
    benefits: {
      heading: cleanText(doc.benefits?.heading),
      items: toSteps(doc.benefits?.items),
      sideImage: toImage(doc.benefits?.sideImage, 'card'),
    },
    schedule: toSchedule(doc.schedule),
    faqs: toFaqs(doc.faqs, context.trialPriceLabel),
    seo: toSeo(doc.seo),
  }
}
