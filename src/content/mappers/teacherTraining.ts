import { formatDate, formatDateRange, formatMonthYear, formatPrice } from '@/lib/format'
import type { TeacherTraining } from '@/payload-types'

import type {
  TeacherTrainingFact,
  TeacherTrainingPageView,
  TeacherTrainingTopic,
  TeacherTrainingView,
} from '../types'
import { originalImageHref, toImage } from './media'
import { asArray, cleanText, isPresent } from './values'

function toFacts(rows: NonNullable<TeacherTraining['teaser']>['facts']): TeacherTrainingFact[] {
  return asArray(rows)
    .map((row) => {
      const value = cleanText(row.value)
      const label = cleanText(row.label)
      return value && label ? { value, label } : null
    })
    .filter(isPresent)
}

/**
 * The teacher training as the teaser needs it. Null without a heading (e.g. a global that was
 * never published), so pages leave the teaser out instead of showing an empty green block.
 */
export function toTeacherTraining(doc: TeacherTraining): TeacherTrainingView | null {
  const heading = cleanText(doc.teaser?.heading)
  if (!heading) return null
  const amount = price(doc.price)
  return {
    startMonthLabel: formatMonthYear(doc.startMonth),
    price: amount,
    priceLabel: formatPrice(amount),
    teaser: {
      heading,
      text: cleanText(doc.teaser?.text),
      facts: toFacts(doc.teaser?.facts),
      priceNote: cleanText(doc.teaser?.priceNote),
    },
  }
}

type WeekendRows = TeacherTraining['weekends']

function toWeekends(rows: WeekendRows): string[] {
  return asArray(rows)
    .map((row) => formatDateRange(row.from, row.to))
    .filter(isPresent)
}

function toTopics(rows: TeacherTraining['topics']): TeacherTrainingTopic[] {
  return asArray(rows)
    .map((row) => {
      const title = cleanText(row.title)
      return title ? { title, text: cleanText(row.text) } : null
    })
    .filter(isPresent)
}

function price(value: number | null | undefined): number | null {
  return typeof value === 'number' && value >= 0 ? value : null
}

/**
 * The page's admin data. Unlike the teaser this is never null: every value may be missing on its
 * own, and the page leaves out each line that has nothing to show.
 */
export function toTeacherTrainingPage(doc: TeacherTraining): TeacherTrainingPageView {
  const firstWeekend = asArray(doc.weekends)[0]
  const flyerImage = doc.flyer?.image
  return {
    startMonthLabel: formatMonthYear(doc.startMonth),
    endMonthLabel: formatMonthYear(doc.endMonth),
    priceLabel: formatPrice(price(doc.price)),
    depositLabel: formatPrice(price(doc.deposit)),
    depositDeadline: cleanText(doc.depositDeadline),
    balanceDeadline: cleanText(doc.balanceDeadline),
    membershipDiscount: cleanText(doc.membershipDiscount),
    weekends: toWeekends(doc.weekends),
    firstDayLabel: formatDate(firstWeekend?.from),
    topics: toTopics(doc.topics),
    requirements: asArray(doc.requirements)
      .map((row) => cleanText(row.text))
      .filter(isPresent),
    certification: cleanText(doc.certification),
    flyer: { image: toImage(flyerImage, 'card'), imageHref: originalImageHref(flyerImage) },
  }
}
