import { describe, expect, it } from 'vitest'

import { downloadsByUsage, toDownload } from '@/content/mappers/downloads'
import { publishableContent, toLegalPage } from '@/content/mappers/legal'
import { signupPlanLabel, toPriceGroup, toSignupPlanGroups } from '@/content/mappers/prices'
import { toTeacherTrainingPage } from '@/content/mappers/teacherTraining'
import type { RichTextData } from '@/content/types'
import type { Download, TeacherTraining } from '@/payload-types'

import { mediaDoc, priceBlock, priceGroupDoc } from '../../fixtures/docs'

const NBSP = ' '
const STAMP = '2026-05-01T10:00:00.000Z'

function text(value: string) {
  return { type: 'text', version: 1, text: value }
}

function block(type: string, value: string) {
  return { type, version: 1, children: [text(value)] }
}

function richText(...children: RichTextData['root']['children']): RichTextData {
  return { root: { type: 'root', children } } as RichTextData
}

describe('legal pages', () => {
  it('keeps finished blocks and leaves out every block with a placeholder', () => {
    const content = richText(
      block('heading', 'Angaben gemäß § 5 DDG'),
      block('paragraph', 'Prana Yoga Studio Essen'),
      block('heading', '[Haftung]'),
      { type: 'list', version: 1, children: [block('listitem', 'Punkt [offen]')] },
    )
    const result = publishableContent(content)
    expect(result?.root.children.map((node) => node.type)).toEqual(['heading', 'paragraph'])
    // The input stays as it was.
    expect(content.root.children).toHaveLength(4)
  })

  it('is null when nothing with words is left', () => {
    expect(publishableContent(richText(block('paragraph', '[Rechtstext]')))).toBeNull()
    expect(publishableContent(richText(block('paragraph', '   ')))).toBeNull()
    expect(publishableContent(richText())).toBeNull()
    expect(publishableContent(null)).toBeNull()
    expect(publishableContent({} as RichTextData)).toBeNull()
  })

  it('maps the "Stand" date and the text', () => {
    const page = toLegalPage({
      updatedOn: '2026-11-11T23:00:00.000Z',
      content: richText(block('paragraph', 'Text')) as never,
    })
    expect(page.updatedOnLabel).toBe('12. November 2026')
    expect(page.content?.root.children).toHaveLength(1)
    expect(toLegalPage({ updatedOn: null, content: null })).toEqual({
      updatedOnLabel: null,
      content: null,
    })
  })
})

function downloadDoc(overrides: Partial<Download> = {}): Download {
  return {
    id: 1,
    title: 'Mitgliedsvertrag 2027',
    usage: 'membership-contract',
    url: '/api/downloads/file/vertrag.pdf',
    filename: 'vertrag.pdf',
    createdAt: STAMP,
    updatedAt: STAMP,
    ...overrides,
  }
}

describe('downloads', () => {
  it('maps a file to its title and versioned same-site path', () => {
    expect(toDownload(downloadDoc())).toEqual({
      title: 'Mitgliedsvertrag 2027',
      href: `/api/downloads/file/vertrag.pdf?v=${Date.parse(STAMP)}`,
    })
  })

  it('drops files without a title or a servable path', () => {
    expect(toDownload(downloadDoc({ title: ' ' }))).toBeNull()
    expect(toDownload(downloadDoc({ url: null }))).toBeNull()
    expect(toDownload(downloadDoc({ url: 'https://evil.test/vertrag.pdf' }))).toBeNull()
    expect(toDownload(downloadDoc({ url: '/api/media/file/vertrag.pdf' }))).toBeNull()
  })

  it('takes the first file per usage and ignores files without one', () => {
    const result = downloadsByUsage([
      downloadDoc({ id: 1, usage: null, title: 'Ohne Verwendung' }),
      downloadDoc({ id: 2, title: 'Erster Vertrag' }),
      downloadDoc({ id: 3, title: 'Zweiter Vertrag' }),
    ])
    expect(result['membership-contract']?.title).toBe('Erster Vertrag')
    expect(result['teacher-training-flyer']).toBeNull()
  })
})

function trainingDoc(overrides: Partial<TeacherTraining> = {}): TeacherTraining {
  return {
    id: 1,
    startMonth: '2027-02-28T23:00:00.000Z',
    endMonth: '2027-10-31T23:00:00.000Z',
    price: 2400,
    deposit: 500,
    depositDeadline: '14 Tage',
    balanceDeadline: '[Frist]',
    membershipDiscount: '10 %',
    weekends: [
      { from: '2027-03-13T23:00:00.000Z', to: '2027-03-14T23:00:00.000Z' },
      { from: 'kaputt', to: null },
      { from: '2027-04-10T22:00:00.000Z', to: '2027-04-11T22:00:00.000Z' },
    ],
    topics: [
      { title: 'Technik & Anatomie', text: 'Die Asanas.' },
      { title: '[Thema]', text: 'versteckt' },
      { title: 'Philosophie', text: '[bestätigen]' },
    ],
    requirements: [{ text: 'Volle Teilnahme' }, { text: 'Mindestens [2 oder 3] Kurse' }],
    certification: 'Yoga Alliance RYT 200',
    flyer: { image: mediaDoc() },
    teaser: { heading: 'Teaser' },
    ...overrides,
  }
}

describe('toTeacherTrainingPage', () => {
  it('maps every filled value and leaves out placeholders and broken rows', () => {
    const page = toTeacherTrainingPage(trainingDoc())
    expect(page.startMonthLabel).toBe('März 2027')
    expect(page.endMonthLabel).toBe('November 2027')
    expect(page.priceLabel).toBe(`2.400${NBSP}€`)
    expect(page.depositLabel).toBe(`500${NBSP}€`)
    expect(page.depositDeadline).toBe('14 Tage')
    expect(page.balanceDeadline).toBeNull()
    expect(page.membershipDiscount).toBe('10 %')
    expect(page.weekends).toEqual(['14.–15. März 2027', '11.–12. April 2027'])
    expect(page.firstDayLabel).toBe('14. März 2027')
    expect(page.topics).toEqual([
      { title: 'Technik & Anatomie', text: 'Die Asanas.' },
      { title: 'Philosophie', text: null },
    ])
    expect(page.requirements).toEqual(['Volle Teilnahme'])
    expect(page.certification).toBe('Yoga Alliance RYT 200')
    expect(page.flyer.image?.src).toMatch(/^\/api\/media\/file\/teacher-660x990\.jpg/)
    expect(page.flyer.imageHref).toMatch(/^\/api\/media\/file\/teacher\.jpg/)
  })

  it('is all empty for a training the studio has not filled in', () => {
    const page = toTeacherTrainingPage({ id: 1, teaser: { heading: 'Teaser' } })
    expect(page).toEqual({
      startMonthLabel: null,
      endMonthLabel: null,
      priceLabel: null,
      depositLabel: null,
      depositDeadline: null,
      balanceDeadline: null,
      membershipDiscount: null,
      weekends: [],
      firstDayLabel: null,
      topics: [],
      requirements: [],
      certification: null,
      flyer: { image: null, imageHref: null },
    })
  })

  it('treats negative amounts as not set', () => {
    const page = toTeacherTrainingPage(trainingDoc({ price: -1, deposit: -5 }))
    expect(page.priceLabel).toBeNull()
    expect(page.depositLabel).toBeNull()
  })
})

describe('signup plans', () => {
  it('labels a plan with price and unit, or just its name', () => {
    expect(signupPlanLabel({ name: '1× pro Woche', priceLabel: '59 €', unit: 'pro Monat' })).toBe(
      '1× pro Woche – 59 € pro Monat',
    )
    expect(signupPlanLabel({ name: '10er-Karte', priceLabel: '150 €', unit: null })).toBe(
      '10er-Karte – 150 €',
    )
    expect(signupPlanLabel({ name: 'Probestunde', priceLabel: null, unit: null })).toBe(
      'Probestunde',
    )
  })

  it('offers only blocks marked for the form, grouped, without empty groups', () => {
    const groups = [
      priceGroupDoc({
        id: 1,
        kicker: 'Mitgliedschaft',
        blocks: [
          priceBlock({ id: 'a', name: '1× pro Woche' }),
          priceBlock({ id: 'b', name: 'Probestunde', showInSignupForm: false }),
        ],
      }),
      priceGroupDoc({
        id: 2,
        kicker: undefined,
        title: 'Karten',
        blocks: [priceBlock({ id: 'c', name: '10er-Karte', unit: null })],
      }),
      priceGroupDoc({
        id: 3,
        blocks: [priceBlock({ id: 'd', showInSignupForm: false })],
      }),
    ]
      .map(toPriceGroup)
      .filter((group) => group !== null)
    expect(toSignupPlanGroups(groups)).toEqual([
      {
        label: 'Mitgliedschaft',
        plans: [{ id: 'a', label: `1× pro Woche – 59${NBSP}€ pro Monat` }],
      },
      { label: 'Karten', plans: [{ id: 'c', label: `10er-Karte – 59${NBSP}€` }] },
    ])
  })
})
