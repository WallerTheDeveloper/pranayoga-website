import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { BringAlongCard, BringAlongList } from '@/components/blocks/BringAlong'
import { FaqList } from '@/components/blocks/FaqList'
import { isPortrait, PageHero } from '@/components/blocks/PageHero'
import { SectionIntro } from '@/components/blocks/SectionIntro'
import { TeacherCardCompact } from '@/components/blocks/TeacherCardCompact'
import { TeacherTrainingTeaser, teaserEyebrow } from '@/components/blocks/TeacherTrainingTeaser'
import { TrialOffer } from '@/components/blocks/TrialOffer'
import { WhatsAppBand } from '@/components/blocks/WhatsAppBand'
import { IconDisc } from '@/components/ui/IconDisc'
import { Section } from '@/components/ui/Section'
import { teacherTrainingCopy } from '@/content/copy/teacherTraining'

import { copyImages, imageData, settingsView, teacherTrainingView } from '../../fixtures/views'

const contact = settingsView().contact
const GROUP_URL = 'https://chat.whatsapp.com/abc'

describe('PageHero', () => {
  it('tells portrait from landscape photos', () => {
    expect(isPortrait(imageData({ width: 600, height: 900 }))).toBe(true)
    expect(isPortrait(imageData({ width: 900, height: 600 }))).toBe(false)
    expect(isPortrait(imageData({ width: 600, height: 600 }))).toBe(false)
    expect(isPortrait(null)).toBe(false)
  })

  it('breadcrumbs, h1 with accent, lead, kicker, children and a preloaded photo', () => {
    const { container } = render(
      <PageHero
        crumbs={[{ label: 'Kurse' }]}
        heading="Yoga-Kurse in"
        accent="Essen-Borbeck"
        lead="Sechs Kurse."
        image={imageData({ alt: 'Vorbeuge' })}
        kicker={<p>Kicker</p>}
        tight
      >
        <p>Unter dem Lead</p>
      </PageHero>,
    )
    const crumbs = screen.getByRole('navigation', { name: 'Sie sind hier' })
    expect(within(crumbs).getByRole('link', { name: 'Startseite' })).toHaveAttribute('href', '/')
    expect(within(crumbs).getByText('Kurse')).toHaveAttribute('aria-current', 'page')
    const heading = screen.getByRole('heading', { level: 1 })
    expect(heading).toHaveTextContent('Yoga-Kurse in Essen-Borbeck')
    expect(heading.querySelector('em')).toHaveTextContent('Essen-Borbeck')
    expect(screen.getByText('Sechs Kurse.')).toBeInTheDocument()
    expect(screen.getByText('Kicker')).toBeInTheDocument()
    expect(screen.getByText('Unter dem Lead')).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'Vorbeuge' })).toHaveAttribute('data-preload', '')
    expect(container.querySelector('figure')).not.toBeNull()
  })

  it('without photo and lead', () => {
    const { container } = render(
      <PageHero crumbs={[{ label: 'Kurse' }]} heading="Kurse" lead={null} image={null} />,
    )
    expect(container.querySelector('figure')).toBeNull()
    expect(container.querySelectorAll('p')).toHaveLength(0)
  })
})

describe('BringAlong', () => {
  it('list with a check per item, nothing when empty', () => {
    render(<BringAlongList items={['Eigene Yogamatte', 'Gute Laune']} size="large" />)
    expect(screen.getAllByRole('listitem')).toHaveLength(2)
    const { container } = render(<BringAlongList items={[]} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('card with eyebrow, h2 and list', () => {
    render(
      <BringAlongCard
        eyebrow="Mitbringen"
        heading="Was Sie mitbringen"
        items={['Eigene Yogamatte']}
        headingId="bring"
      />,
    )
    expect(screen.getByRole('heading', { level: 2 })).toHaveAttribute('id', 'bring')
    expect(screen.getByText('Mitbringen')).toBeInTheDocument()
  })
})

describe('TeacherCardCompact', () => {
  it('portrait, name, credentials and the link to "Über uns"', () => {
    render(<TeacherCardCompact images={copyImages()} />)
    expect(screen.getByRole('img')).toHaveAttribute('alt', 'Bild teacherSmall')
    expect(screen.getByText(/E-RYT 500/)).toBeInTheDocument()
    expect(screen.getByRole('link')).toHaveAttribute('href', '/ueber-uns/')
  })

  it('keeps the text without a portrait', () => {
    render(<TeacherCardCompact images={copyImages(false)} />)
    expect(screen.queryByRole('img')).toBeNull()
    expect(screen.getByText('Liudmyla Schiemann')).toBeInTheDocument()
  })
})

describe('TeacherTrainingTeaser', () => {
  it('names the start month only when set', () => {
    expect(teaserEyebrow('März 2027')).toBe('Yogaausbildung · Start März 2027')
    expect(teaserEyebrow(null)).toBe('Yogaausbildung')
  })

  it('heading, text, button and facts with the price last', () => {
    const { container } = render(
      <TeacherTrainingTeaser training={teacherTrainingView()} headingId="training-heading" />,
    )
    expect(screen.getByRole('heading', { level: 2 })).toHaveAttribute('id', 'training-heading')
    expect(screen.getByText('Yogaausbildung · Start März 2027')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Zur Yogaausbildung/ })).toHaveAttribute(
      'href',
      '/yogaausbildungen/',
    )
    const terms = [...container.querySelectorAll('dt')].map((dt) => dt.textContent)
    expect(terms).toEqual(['200 Stunden', '9 Wochenenden', '2.400 €'])
    expect(container.querySelectorAll('dd')).toHaveLength(3)
    expect(screen.getByText('inkl. Arbeitsmaterial')).toBeInTheDocument()
  })

  it('pairs the price with a fallback term when the note is empty', () => {
    const base = teacherTrainingView()
    const { container } = render(
      <TeacherTrainingTeaser
        training={teacherTrainingView({
          teaser: { ...base.teaser, facts: [], priceNote: null },
        })}
      />,
    )
    expect(container.querySelector('dd')).toHaveTextContent(teacherTrainingCopy.teaser.priceTerm)
  })

  it('no facts list without facts and price, no text when empty', () => {
    const base = teacherTrainingView()
    const { container } = render(
      <TeacherTrainingTeaser
        training={teacherTrainingView({
          startMonthLabel: null,
          price: null,
          priceLabel: null,
          teaser: { ...base.teaser, text: null, facts: [] },
        })}
      />,
    )
    expect(container.querySelector('dl')).toBeNull()
    expect(screen.queryByText(base.teaser.text!)).toBeNull()
    expect(screen.getByText('Yogaausbildung')).toBeInTheDocument()
  })
})

describe('FaqList', () => {
  it('native details, the first open, answers keep their line breaks', () => {
    const { container } = render(
      <FaqList
        faqs={[
          { question: 'Frage eins?', answer: 'Zeile eins\nZeile zwei' },
          { question: 'Frage zwei?', answer: 'Antwort.' },
        ]}
      />,
    )
    const details = container.querySelectorAll('details')
    expect(details).toHaveLength(2)
    expect(details[0]).toHaveAttribute('open')
    expect(details[1]).not.toHaveAttribute('open')
    expect(details[0]!.querySelector('summary')).toHaveTextContent('Frage eins?')
    expect(details[0]!.querySelector('p')?.textContent).toBe('Zeile eins\nZeile zwei')
  })

  it('renders nothing without questions', () => {
    const { container } = render(<FaqList faqs={[]} />)
    expect(container).toBeEmptyDOMElement()
  })
})

describe('shared block options added for the course pages', () => {
  it('WhatsAppBand takes a custom hint', () => {
    render(<WhatsAppBand groupUrl={GROUP_URL} contact={contact} hint="Eigener Hinweis" />)
    expect(screen.getByText('Eigener Hinweis')).toBeInTheDocument()
  })

  it('TrialOffer shows its children above the booking block and passes the hint', () => {
    render(
      <TrialOffer
        trial={{ name: 'Probestunde', price: 15, priceLabel: '15 €', unit: null }}
        eyebrow="Kurszeiten & Probestunde"
        priceJoiner="für"
        text="Eine Stunde."
        groupUrl={GROUP_URL}
        contact={contact}
        hint="Kurs-Hinweis"
      >
        <p>Kurszeiten-Liste</p>
      </TrialOffer>,
    )
    const schedule = screen.getByText('Kurszeiten-Liste')
    const hint = screen.getByText('Kurs-Hinweis')
    expect(schedule.compareDocumentPosition(hint) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })

  it('SectionIntro without an eyebrow', () => {
    const { container } = render(<SectionIntro heading="Weitere Kurse" headingId="related" />)
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Weitere Kurse')
    expect(container.querySelectorAll('p')).toHaveLength(0)
  })

  it('IconDisc sizes its icon per disc size', () => {
    const { container } = render(
      <>
        <IconDisc icon="hatha" />
        <IconDisc icon="hatha" size="medium" />
        <IconDisc icon="hatha" size="small" />
      </>,
    )
    const widths = [...container.querySelectorAll('svg')].map((svg) => svg.getAttribute('width'))
    expect(widths).toEqual(['44', '40', '30'])
  })

  it('Section stacks wide', () => {
    const { container } = render(
      <Section stack="wide">
        <p>Inhalt</p>
      </Section>,
    )
    const inner = container.querySelector('section > div')
    expect(inner?.className).toMatch(/stack/)
    expect(inner?.className).toMatch(/wide/)
  })
})
