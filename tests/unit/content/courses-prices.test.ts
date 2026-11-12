import { describe, expect, it } from 'vitest'

import {
  toCourseDetail,
  toCourseSummary,
  toFaqs,
  toSchedule,
  toSeo,
} from '@/content/mappers/courses'
import { findTrialOffer, toPriceBlock, toPriceGroup } from '@/content/mappers/prices'
import type { Course } from '@/payload-types'

import { courseDoc, mediaDoc, priceBlock, priceGroupDoc } from '../../fixtures/docs'

describe('toCourseSummary', () => {
  it('maps a published course to its card', () => {
    const summary = toCourseSummary(courseDoc({ badge: { text: 'Neu', tone: 'dark' } }))
    expect(summary).toMatchObject({
      slug: 'hatha-yoga',
      href: '/kurse/hatha-yoga/',
      title: 'Hatha Yoga',
      icon: 'hatha',
      badge: { text: 'Neu', tone: 'dark' },
    })
    expect(summary?.cardImage?.width).toBe(660)
  })

  it('defaults the badge tone to light and hides an empty badge', () => {
    expect(toCourseSummary(courseDoc({ badge: { text: '50 Plus' } }))?.badge).toEqual({
      text: '50 Plus',
      tone: 'light',
    })
    expect(toCourseSummary(courseDoc())?.badge).toBeNull()
  })

  it('drops courses that cannot make a card', () => {
    expect(toCourseSummary(courseDoc({ title: ' ' }))).toBeNull()
    expect(toCourseSummary(courseDoc({ slug: '../admin' }))).toBeNull()
    expect(toCourseSummary(courseDoc({ icon: 'unknown' as Course['icon'] }))).toBeNull()
  })
})

describe('toSchedule', () => {
  it('sorts by weekday then start and formats labels', () => {
    const schedule = toSchedule([
      { weekday: 'wednesday', start: '18:00', end: '19:30' },
      { weekday: 'monday', start: '19:00' },
      { weekday: 'monday', start: '09:30', end: '10:45' },
    ])
    expect(schedule.map((row) => row.weekdayLabel)).toEqual(['Montag', 'Montag', 'Mittwoch'])
    expect(schedule[0]?.timeLabel).toMatch(/^09:30/)
    expect(schedule[1]?.timeLabel).toMatch(/^19:00/)
  })

  it('skips invalid rows and invalid end times', () => {
    const schedule = toSchedule([
      { weekday: 'funday' as 'monday', start: '10:00' },
      { weekday: 'friday', start: '25:00' },
      { weekday: 'friday', start: '10:00', end: 'later' },
    ])
    expect(schedule).toHaveLength(1)
    expect(schedule[0]?.timeLabel).toMatch(/^10:00/)
    expect(toSchedule(null)).toEqual([])
  })
})

describe('toFaqs', () => {
  const rows = [
    { question: 'Was kostet eine Probestunde?', answer: 'Sie kostet [Preis Probestunde].' },
    { question: 'Was mitbringen?', answer: 'Eine Matte.' },
    { question: 'Wie lange?', answer: 'Mindestens [Monate].' },
    { question: ' ', answer: 'Ohne Frage.' },
  ]

  it('fills the trial price and hides answers with open placeholders', () => {
    expect(toFaqs(rows, '15 €')).toEqual([
      { question: 'Was kostet eine Probestunde?', answer: 'Sie kostet 15 €.' },
      { question: 'Was mitbringen?', answer: 'Eine Matte.' },
    ])
  })

  it('hides the price answer while no trial price is set', () => {
    expect(toFaqs(rows, null).map((faq) => faq.question)).toEqual(['Was mitbringen?'])
  })
})

describe('toSeo and toCourseDetail', () => {
  it('maps SEO values with the card image', () => {
    expect(toSeo({ title: ' Titel ', description: '', image: mediaDoc() })).toMatchObject({
      title: 'Titel',
      description: null,
      image: { width: 660 },
    })
    expect(toSeo(undefined)).toEqual({ title: null, description: null, image: null })
  })

  it('builds the full course page model', () => {
    const detail = toCourseDetail(
      courseDoc({
        audience: { paragraphs: [{ text: 'A' }, { text: '[offen]' }], quote: '„Klang“' },
        steps: {
          heading: 'Schritte',
          items: [
            { title: 'Atmung', text: 'Pranayama.' },
            { title: 'Leer', text: ' ' },
          ],
        },
        faqs: [{ question: 'Preis?', answer: '[Preis Probestunde]' }],
      }),
      { trialPriceLabel: '15 €' },
    )
    expect(detail?.hero.image?.width).toBe(760)
    expect(detail?.hero.secondaryImage).toBeNull()
    expect(detail?.audience).toEqual({
      heading: null,
      paragraphs: ['A'],
      quote: '„Klang“',
    })
    expect(detail?.steps.items).toHaveLength(1)
    expect(detail?.faqs).toEqual([{ question: 'Preis?', answer: '15 €' }])
  })

  it('returns null when the summary is invalid', () => {
    expect(toCourseDetail(courseDoc({ title: '' }), { trialPriceLabel: null })).toBeNull()
  })
})

describe('price mappers', () => {
  it('maps a block with price label, badge and visible inclusions', () => {
    const block = toPriceBlock(
      priceBlock({
        badge: 'popular',
        highlighted: true,
        inclusions: [{ text: 'Jeder Kurs' }, { text: 'Mindestlaufzeit [Monate]' }],
      }),
      0,
    )
    expect(block).toMatchObject({
      id: 'block-1',
      badge: 'popular',
      highlighted: true,
      price: 59,
      inclusions: ['Jeder Kurs'],
      action: 'signup',
    })
    expect(block?.priceLabel).toMatch(/59/)
  })

  it('treats missing or negative prices as not set', () => {
    expect(toPriceBlock(priceBlock({ price: null }), 0)?.priceLabel).toBeNull()
    expect(toPriceBlock(priceBlock({ price: -1 }), 0)?.price).toBeNull()
    expect(toPriceBlock(priceBlock({ badge: 'none', action: 'whatsapp' }), 0)).toMatchObject({
      badge: null,
      action: 'whatsapp',
    })
    expect(toPriceBlock(priceBlock({ name: '' }), 0)).toBeNull()
  })

  it('drops groups without title or blocks', () => {
    expect(toPriceGroup(priceGroupDoc())?.blocks).toHaveLength(1)
    expect(toPriceGroup(priceGroupDoc({ title: '' }))).toBeNull()
    expect(toPriceGroup(priceGroupDoc({ blocks: [] }))).toBeNull()
    expect(toPriceGroup(priceGroupDoc({ kicker: '', description: null }))).toMatchObject({
      kicker: '',
      description: null,
    })
  })

  it('finds the trial block across groups', () => {
    const groups = [
      toPriceGroup(priceGroupDoc()),
      toPriceGroup(
        priceGroupDoc({
          id: 9,
          blocks: [priceBlock({ name: 'Probestunde', isTrial: true, price: 15, unit: 'einmalig' })],
        }),
      ),
    ].filter((group) => group !== null)
    expect(findTrialOffer(groups)).toMatchObject({
      name: 'Probestunde',
      price: 15,
      unit: 'einmalig',
    })
    expect(findTrialOffer(groups.slice(0, 1))).toBeNull()
  })
})
