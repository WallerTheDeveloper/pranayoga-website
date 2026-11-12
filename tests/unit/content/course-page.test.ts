import { describe, expect, it } from 'vitest'

import { toCourseDetail, toCourseSummary } from '@/content/mappers/courses'
import { coursePriceLines, toPriceBlock, toPriceGroup } from '@/content/mappers/prices'
import { pickRelatedCourses } from '@/content/mappers/related'
import type { PriceGroupView } from '@/content/types'

import { courseDoc, priceBlock, priceGroupDoc } from '../../fixtures/docs'
import { courseSummary } from '../../fixtures/views'

/** Phase 2 additions to the course view models: audience label, price line, related courses. */

describe('toCourseSummary: audience label', () => {
  it('carries the hero audience label for the overview cards', () => {
    expect(toCourseSummary(courseDoc())?.audienceLabel).toBe('Für jeden geeignet')
  })

  it('is null when empty or still a placeholder', () => {
    const empty = courseDoc({ hero: { ...courseDoc().hero, audienceLabel: ' ' } })
    const open = courseDoc({ hero: { ...courseDoc().hero, audienceLabel: '[Zielgruppe]' } })
    expect(toCourseSummary(empty)?.audienceLabel).toBeNull()
    expect(toCourseSummary(open)?.audienceLabel).toBeNull()
  })
})

describe('price blocks linked to a course', () => {
  it('reads the course id from a plain id or a populated course', () => {
    expect(toPriceBlock(priceBlock({ course: 4 }), 0)?.courseId).toBe(4)
    expect(toPriceBlock(priceBlock({ course: courseDoc({ id: 5 }) }), 0)?.courseId).toBe(5)
    expect(toPriceBlock(priceBlock({ course: null }), 0)?.courseId).toBeNull()
    expect(toPriceBlock(priceBlock(), 0)?.courseId).toBeNull()
  })

  function groups(...blocks: Parameters<typeof priceBlock>[0][]): PriceGroupView[] {
    const group = toPriceGroup(priceGroupDoc({ blocks: blocks.map((b) => priceBlock(b)) }))
    return group ? [group] : []
  }

  it('maps each course to the first linked block with a price', () => {
    const lines = coursePriceLines(
      groups(
        { id: 'a', name: 'Ohne Preis', price: null, course: 4 },
        { id: 'b', name: 'Yoga für Jugendliche', price: 45, unit: 'pro Monat', course: 4 },
        { id: 'c', name: 'Zweiter', price: 50, course: 4 },
        { id: 'd', name: 'Ungebunden', price: 10 },
      ),
    )
    expect([...lines.keys()]).toEqual([4])
    expect(lines.get(4)).toMatchObject({ name: 'Yoga für Jugendliche', unit: 'pro Monat' })
    expect(lines.get(4)?.priceLabel).toMatch(/^45/)
  })

  it('drops an open unit placeholder but keeps the line', () => {
    const lines = coursePriceLines(
      groups({ name: 'Jugend', price: 30, unit: '[Einheit]', course: 2 }),
    )
    expect(lines.get(2)?.unit).toBeNull()
  })
})

describe('toCourseDetail: price line', () => {
  const lines = new Map([[1, { name: 'Hatha', priceLabel: '20 €', unit: null }]])

  it('picks the line linked to this course', () => {
    const detail = toCourseDetail(courseDoc(), { trialPriceLabel: null, priceLines: lines })
    expect(detail?.priceLine).toEqual({ name: 'Hatha', priceLabel: '20 €', unit: null })
  })

  it('is null for a course without a linked price', () => {
    const detail = toCourseDetail(courseDoc({ id: 2 }), {
      trialPriceLabel: null,
      priceLines: lines,
    })
    expect(detail?.priceLine).toBeNull()
  })
})

describe('pickRelatedCourses', () => {
  const six = ['hatha', 'back', 'bowls', 'teens', 'wheel', 'balance'].map((slug) =>
    courseSummary({ slug, href: `/kurse/${slug}/`, title: slug }),
  )
  const slugsFor = (slug: string) => pickRelatedCourses(six, slug).map((course) => course.slug)

  it('takes the nearest courses in admin order, earlier ones first on a tie', () => {
    expect(slugsFor('hatha')).toEqual(['back', 'bowls', 'teens'])
    expect(slugsFor('back')).toEqual(['hatha', 'bowls', 'teens'])
    expect(slugsFor('bowls')).toEqual(['hatha', 'back', 'teens'])
    expect(slugsFor('wheel')).toEqual(['bowls', 'teens', 'balance'])
    expect(slugsFor('balance')).toEqual(['bowls', 'teens', 'wheel'])
  })

  it('never includes the course itself and copes with short lists', () => {
    expect(pickRelatedCourses(six.slice(0, 2), 'hatha').map((c) => c.slug)).toEqual(['back'])
    expect(pickRelatedCourses(six.slice(0, 1), 'hatha')).toEqual([])
    expect(pickRelatedCourses([], 'hatha')).toEqual([])
  })

  it('falls back to the first courses when the current one is not listed', () => {
    expect(pickRelatedCourses(six, 'draft-only').map((c) => c.slug)).toEqual([
      'hatha',
      'back',
      'bowls',
    ])
  })

  it('respects a custom count and leaves the input untouched', () => {
    const before = six.map((course) => course.slug)
    expect(pickRelatedCourses(six, 'teens', 2).map((c) => c.slug)).toEqual(['bowls', 'wheel'])
    expect(six.map((course) => course.slug)).toEqual(before)
  })
})
