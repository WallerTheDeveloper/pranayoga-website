import { describe, expect, it } from 'vitest'

import { toTeacherTraining } from '@/content/mappers/teacherTraining'
import { formatMonthYear } from '@/lib/format'
import type { TeacherTraining } from '@/payload-types'

const NBSP = ' '

function trainingDoc(overrides: Partial<TeacherTraining> = {}): TeacherTraining {
  return {
    id: 1,
    startMonth: '2027-02-28T23:00:00.000Z',
    price: 2400,
    teaser: {
      heading: 'Werden Sie selbst Yogalehrerin oder Yogalehrer.',
      text: 'Lernen Sie bei Liudmyla Schiemann.',
      facts: [
        { value: '200 Stunden', label: 'Theorie und Praxis' },
        { value: '9 Wochenenden', label: '[bestätigen]' },
        { value: ' ', label: 'leer' },
      ],
      priceNote: 'inkl. Arbeitsmaterial',
    },
    ...overrides,
  }
}

describe('formatMonthYear', () => {
  it('names the month in German, in the studio time zone', () => {
    // The admin's month picker stores local midnight on the 1st, i.e. the evening before in UTC.
    expect(formatMonthYear('2027-02-28T23:00:00.000Z')).toBe('März 2027')
    expect(formatMonthYear('2026-10-01T00:00:00.000Z')).toBe('Oktober 2026')
  })

  it('returns null for missing or invalid dates', () => {
    expect(formatMonthYear(null)).toBeNull()
    expect(formatMonthYear(undefined)).toBeNull()
    expect(formatMonthYear('')).toBeNull()
    expect(formatMonthYear('kein Datum')).toBeNull()
  })
})

describe('toTeacherTraining', () => {
  it('maps the teaser with start month, price and complete facts only', () => {
    expect(toTeacherTraining(trainingDoc())).toEqual({
      startMonthLabel: 'März 2027',
      price: 2400,
      priceLabel: `2.400${NBSP}€`,
      teaser: {
        heading: 'Werden Sie selbst Yogalehrerin oder Yogalehrer.',
        text: 'Lernen Sie bei Liudmyla Schiemann.',
        facts: [{ value: '200 Stunden', label: 'Theorie und Praxis' }],
        priceNote: 'inkl. Arbeitsmaterial',
      },
    })
  })

  it('leaves out what the admin has not filled in yet', () => {
    const view = toTeacherTraining(
      trainingDoc({
        startMonth: null,
        price: null,
        teaser: { heading: 'Ausbildung', text: ' ', facts: null, priceNote: '[Hinweis]' },
      }),
    )
    expect(view).toMatchObject({
      startMonthLabel: null,
      price: null,
      priceLabel: null,
      teaser: { heading: 'Ausbildung', text: null, facts: [], priceNote: null },
    })
  })

  it('is null without a heading, so the teaser is not rendered', () => {
    expect(
      toTeacherTraining(trainingDoc({ teaser: { ...trainingDoc().teaser, heading: '' } })),
    ).toBeNull()
    // A global that was never saved comes back without the group.
    expect(toTeacherTraining({ id: 1 } as TeacherTraining)).toBeNull()
  })
})
