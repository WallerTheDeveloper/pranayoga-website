import { revalidateTag } from 'next/cache'
import type { Payload } from 'payload'
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import { getDownloads, getLegalPage, getSignupPlanGroups, getTeacherTrainingPage } from '@/content'
import type { User } from '@/payload-types'

import { nextState, resetNextState } from '../setup/nextState'
import {
  ADMIN_EMAIL,
  ADMIN_PASSWORD,
  adminUser,
  closePayload,
  getTestPayload,
  uploadImage,
  wipeCollections,
} from './helpers'

/** Phase-3 content: downloads, the legal globals and the teacher-training page fields. */

const SYSTEM = { overrideAccess: true, context: { disableRevalidate: true } } as const

let payload: Payload
let admin: User & { collection: 'users' }
let adminHeaders: Headers

const expired = () => vi.mocked(revalidateTag).mock.calls.map(([tag]) => tag)

/** The smallest PDF Payload accepts: header, catalog, xref table and EOF marker. */
const MINIMAL_PDF = [
  '%PDF-1.4',
  '1 0 obj <</Type /Catalog /Pages 2 0 R>> endobj',
  '2 0 obj <</Type /Pages /Kids [] /Count 0>> endobj',
  'xref',
  '0 3',
  '0000000000 65535 f ',
  'trailer <</Size 3 /Root 1 0 R>>',
  'startxref',
  '0',
  '%%EOF',
  '',
].join('\n')

function pdfFile(name: string) {
  const data = Buffer.from(MINIMAL_PDF, 'latin1')
  return { data, mimetype: 'application/pdf', name, size: data.length }
}

function paragraph(text: string) {
  return {
    type: 'paragraph',
    version: 1,
    direction: 'ltr' as const,
    format: '' as const,
    indent: 0,
    textFormat: 0,
    children: [{ type: 'text', version: 1, text, format: 0, detail: 0, mode: 'normal', style: '' }],
  }
}

function legalContent(...texts: string[]) {
  return {
    root: {
      type: 'root',
      version: 1,
      direction: 'ltr' as const,
      format: '' as const,
      indent: 0,
      children: texts.map(paragraph),
    },
  }
}

beforeAll(async () => {
  payload = await getTestPayload()
  await wipeCollections(payload)
  admin = await adminUser(payload)
  const { token } = await payload.login({
    collection: 'users',
    data: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD },
  })
  adminHeaders = new Headers({ Authorization: `JWT ${token}` })
})

afterAll(async () => {
  await closePayload(payload)
})

beforeEach(() => {
  vi.mocked(revalidateTag).mockClear()
})

afterEach(() => {
  resetNextState()
})

describe('downloads', () => {
  it('only logged-in users upload; a new file clears the downloads tag', async () => {
    await expect(
      payload.create({
        collection: 'downloads',
        data: { title: 'Spam', usage: 'membership-contract' },
        file: pdfFile('spam.pdf'),
        overrideAccess: false,
      }),
    ).rejects.toMatchObject({ status: 403 })

    await payload.create({
      collection: 'downloads',
      data: { title: 'Mitgliedsvertrag 2027', usage: 'membership-contract' },
      file: pdfFile('vertrag.pdf'),
      user: admin,
    })
    expect(expired()).toEqual(['downloads'])
  })

  it('accepts PDFs only and one file per usage', async () => {
    await expect(
      payload.create({
        collection: 'downloads',
        data: { title: 'Bild' },
        file: { data: Buffer.from('nope'), mimetype: 'text/plain', name: 'x.txt', size: 4 },
        ...SYSTEM,
      }),
    ).rejects.toThrow()
    await expect(
      payload.create({
        collection: 'downloads',
        data: { title: 'Zweiter Vertrag', usage: 'membership-contract' },
        file: pdfFile('vertrag-2.pdf'),
        ...SYSTEM,
      }),
    ).rejects.toThrow()
  })

  it('visitors read them; the pages get one versioned link per usage', async () => {
    const visible = await payload.find({ collection: 'downloads', overrideAccess: false })
    expect(visible.docs.map((doc) => doc.title)).toEqual(['Mitgliedsvertrag 2027'])

    const downloads = await getDownloads()
    expect(downloads['membership-contract']).toEqual({
      title: 'Mitgliedsvertrag 2027',
      href: expect.stringMatching(/^\/api\/downloads\/file\/vertrag\.pdf\?v=\d+$/),
    })
    expect(downloads['teacher-training-flyer']).toBeNull()
  })
})

describe('legal pages', () => {
  it('visitors see the published text without unfinished paragraphs', async () => {
    await payload.updateGlobal({
      slug: 'legal-notice',
      data: {
        updatedOn: '2026-11-11T23:00:00.000Z',
        content: legalContent('Prana Yoga Studio Essen', '[Haftung – folgt]'),
        _status: 'published',
      },
      user: admin,
    })
    expect(expired()).toEqual(['legal-notice'])

    const page = await getLegalPage('legal-notice')
    expect(page.updatedOnLabel).toBe('12. November 2026')
    expect(page.content?.root.children).toHaveLength(1)
  })

  it('a draft shows only in preview', async () => {
    await payload.updateGlobal({
      slug: 'privacy-policy',
      data: { content: legalContent('Veröffentlicht'), _status: 'published' },
      ...SYSTEM,
    })
    vi.mocked(revalidateTag).mockClear()
    await payload.updateGlobal({
      slug: 'privacy-policy',
      data: { content: legalContent('Entwurf') },
      draft: true,
      user: admin,
    })
    expect(expired()).toEqual([])

    const textOf = (page: Awaited<ReturnType<typeof getLegalPage>>) =>
      JSON.stringify(page.content?.root.children)
    expect(textOf(await getLegalPage('privacy-policy'))).toContain('Veröffentlicht')

    nextState.draftMode = true
    nextState.headers = adminHeaders
    expect(textOf(await getLegalPage('privacy-policy'))).toContain('Entwurf')
  })

  it('visitors cannot write them', async () => {
    await expect(
      payload.updateGlobal({
        slug: 'legal-notice',
        data: { content: legalContent('Gehackt') },
        overrideAccess: false,
      }),
    ).rejects.toMatchObject({ status: 403 })
  })
})

describe('teacher-training page', () => {
  it('maps the page fields from the published global', async () => {
    const flyer = await uploadImage(payload, 800, 1131, 'flyer.jpg')
    await payload.updateGlobal({
      slug: 'teacher-training',
      data: {
        startMonth: '2027-02-28T23:00:00.000Z',
        price: 2400,
        deposit: 500,
        depositDeadline: '14 Tage',
        weekends: [{ from: '2027-03-13T23:00:00.000Z', to: '2027-03-14T23:00:00.000Z' }],
        topics: [{ title: 'Technik & Anatomie', text: 'Die Asanas.' }],
        requirements: [{ text: 'Volle Teilnahme' }, { text: 'Mindestens [2 oder 3] Kurse' }],
        certification: '[bestätigen]',
        flyer: { image: flyer },
        teaser: { heading: 'Werden Sie Yogalehrerin.' },
        _status: 'published',
      },
      user: admin,
    })
    expect(expired()).toEqual(['teacher-training'])

    const page = await getTeacherTrainingPage()
    expect(page.startMonthLabel).toBe('März 2027')
    expect(page.weekends).toEqual(['14.–15. März 2027'])
    expect(page.firstDayLabel).toBe('14. März 2027')
    expect(page.topics).toEqual([{ title: 'Technik & Anatomie', text: 'Die Asanas.' }])
    expect(page.requirements).toEqual(['Volle Teilnahme'])
    expect(page.certification).toBeNull()
    expect(page.flyer.image).not.toBeNull()
  })
})

describe('signup plans', () => {
  it('offer only published blocks marked for the form', async () => {
    await payload.create({
      collection: 'price-groups',
      data: {
        kicker: 'Mitgliedschaft',
        title: 'Regelmäßig üben',
        blocks: [
          {
            name: '1× pro Woche',
            badge: 'none',
            action: 'signup',
            price: 59,
            unit: 'pro Monat',
            showInSignupForm: true,
          },
          {
            name: 'Probestunde',
            badge: 'none',
            action: 'whatsapp',
            price: 15,
            showInSignupForm: false,
          },
        ],
        _status: 'published',
      },
      ...SYSTEM,
    })
    await payload.create({
      collection: 'price-groups',
      data: {
        kicker: 'Entwurf',
        title: 'Noch nicht live',
        blocks: [
          { name: 'Geheim', badge: 'none', action: 'signup', price: 1, showInSignupForm: true },
        ],
        _status: 'draft',
      },
      draft: true,
      ...SYSTEM,
    })

    const groups = await getSignupPlanGroups()
    expect(groups.map((group) => group.label)).toEqual(['Mitgliedschaft'])
    expect(groups[0]?.plans.map((plan) => plan.label)).toEqual(['1× pro Woche – 59 € pro Monat'])
  })
})
