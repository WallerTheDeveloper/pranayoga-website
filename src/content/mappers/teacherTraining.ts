import { formatMonthYear, formatPrice } from '@/lib/format'
import type { TeacherTraining } from '@/payload-types'

import type { TeacherTrainingFact, TeacherTrainingView } from '../types'
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
  const price = typeof doc.price === 'number' && doc.price >= 0 ? doc.price : null
  return {
    startMonthLabel: formatMonthYear(doc.startMonth),
    price,
    priceLabel: formatPrice(price),
    teaser: {
      heading,
      text: cleanText(doc.teaser?.text),
      facts: toFacts(doc.teaser?.facts),
      priceNote: cleanText(doc.teaser?.priceNote),
    },
  }
}
