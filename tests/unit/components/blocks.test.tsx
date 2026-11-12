import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { PranaBand } from '@/components/blocks/PranaBand'
import { ReviewList } from '@/components/blocks/ReviewList'
import { SectionIntro } from '@/components/blocks/SectionIntro'
import { TeacherCard } from '@/components/blocks/TeacherCard'
import { TrialOffer } from '@/components/blocks/TrialOffer'
import { WhatsAppBand } from '@/components/blocks/WhatsAppBand'
import { CourseGrid } from '@/components/courses/CourseCard'
import { HomeHero } from '@/components/home/HomeHero'
import { NewInStudio, resolveNewCourses } from '@/components/home/NewInStudio'
import { homeCopy } from '@/content/copy/home'

import { COURSES, copyImages, imageData, settingsView } from '../../fixtures/views'

const contact = settingsView().contact
const GROUP_URL = 'https://chat.whatsapp.com/abc'

describe('WhatsAppBand', () => {
  it('shows the booking button, hint and personal chips', () => {
    render(<WhatsAppBand groupUrl={GROUP_URL} contact={contact} />)
    expect(screen.getByRole('link', { name: /Termin über WhatsApp/ })).toHaveAttribute(
      'href',
      GROUP_URL,
    )
    expect(screen.getByText('Lieber persönlich?')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: '0175 5830372' })).toHaveAttribute(
      'href',
      'tel:+491755830372',
    )
    expect(screen.getByRole('link', { name: 'E-Mail schreiben' })).toHaveAttribute(
      'href',
      'mailto:info@pranayogastudio.de',
    )
  })

  it('shows the address instead of the prompt when asked', () => {
    render(<WhatsAppBand groupUrl={GROUP_URL} contact={contact} personalPrompt={false} />)
    expect(screen.queryByText('Lieber persönlich?')).toBeNull()
    expect(screen.getByRole('link', { name: 'info@pranayogastudio.de' })).toBeInTheDocument()
  })

  it('hides the button without a group link and the chips without contacts', () => {
    const empty = { ...contact, phoneHref: null, emailHref: null }
    const { container } = render(<WhatsAppBand groupUrl={null} contact={empty} />)
    expect(container.querySelectorAll('a')).toHaveLength(0)
  })
})

describe('TrialOffer', () => {
  const props = {
    eyebrow: 'Einstieg',
    priceJoiner: 'für',
    text: 'Eine Stunde in einem Kurs Ihrer Wahl.',
    groupUrl: GROUP_URL,
    contact,
    headingId: 'trial-heading',
  }

  it('shows name and price in the heading', () => {
    render(
      <TrialOffer
        {...props}
        trial={{ name: 'Probestunde', price: 15, priceLabel: '15 €', unit: 'einmalig' }}
      />,
    )
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Probestunde für 15 €')
  })

  it('shows only the name while no price is set', () => {
    render(
      <TrialOffer
        {...props}
        trial={{ name: 'Probestunde', price: null, priceLabel: null, unit: null }}
      />,
    )
    const heading = screen.getByRole('heading', { level: 2 })
    expect(heading).toHaveTextContent(/^Probestunde$/)
    expect(heading.querySelector('em')).toBeNull()
  })
})

describe('ReviewList', () => {
  it('renders each review with author and source', () => {
    render(
      <ReviewList
        reviews={[
          { id: '1', author: 'Alex', text: 'Tolles Studio.', source: 'Google-Bewertung' },
          { id: '2', author: 'Adem', text: 'Sehr ruhig.', source: 'Google-Bewertung' },
        ]}
      />,
    )
    const items = screen.getAllByRole('listitem')
    expect(items).toHaveLength(2)
    expect(within(items[1]!).getByText('Adem')).toBeInTheDocument()
  })

  it('renders nothing without reviews', () => {
    const { container } = render(<ReviewList reviews={[]} />)
    expect(container).toBeEmptyDOMElement()
  })
})

describe('section blocks', () => {
  it('SectionIntro renders heading, intro and action', () => {
    render(
      <SectionIntro
        eyebrow="Kurse"
        heading="Unsere Yoga-Kurse –"
        accent="für jeden geeignet."
        headingId="courses-heading"
        intro="Ganz egal, wie alt Sie sind."
        action={<a href="/kurse/">Alle Kurse ansehen</a>}
      />,
    )
    expect(screen.getByRole('heading', { level: 2 })).toHaveAttribute('id', 'courses-heading')
    expect(screen.getByText('Ganz egal, wie alt Sie sind.')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Alle Kurse ansehen' })).toBeInTheDocument()
  })

  it('SectionIntro without intro or action', () => {
    const { container } = render(<SectionIntro eyebrow="Stimmen" heading="Bewertungen" />)
    expect(container.querySelectorAll('p')).toHaveLength(1)
  })

  it('PranaBand marks the Sanskrit word', () => {
    render(<PranaBand word="Prana" eyebrow="Warum Prana?" text="Lebensenergie." />)
    expect(screen.getByText('Prana')).toHaveAttribute('lang', 'sa')
  })

  it('TeacherCard shows portrait and decorative seals', () => {
    render(<TeacherCard images={copyImages()} headingId="teacher-heading" />)
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Liudmyla Schiemann')
    expect(screen.getByRole('img', { name: 'Bild teacherPortrait' })).toBeInTheDocument()
    const seals = screen.getByRole('list', { name: /Yoga Alliance/ })
    expect(within(seals).getAllByRole('listitem')).toHaveLength(3)
    seals.querySelectorAll('img').forEach((img) => expect(img).toHaveAttribute('alt', ''))
    expect(screen.getByRole('link', { name: /Mehr über Liudmyla/ })).toHaveAttribute(
      'href',
      '/ueber-uns/',
    )
  })

  it('TeacherCard tolerates missing images', () => {
    const { container } = render(<TeacherCard images={copyImages(false)} />)
    expect(container.querySelectorAll('img')).toHaveLength(0)
  })
})

describe('home sections', () => {
  it('CourseGrid links every course card', () => {
    render(<CourseGrid courses={COURSES} linkLabel="Mehr erfahren" />)
    expect(screen.getAllByRole('link')).toHaveLength(2)
    expect(screen.getByRole('link', { name: /Rad Yoga/ })).toHaveAttribute(
      'href',
      '/kurse/rad-yoga/',
    )
    expect(screen.getByText('Neu')).toBeInTheDocument()
  })

  it('resolveNewCourses keeps only published courses', () => {
    const teasers = resolveNewCourses(homeCopy.newInStudio.items, COURSES)
    expect(teasers.map((teaser) => teaser.href)).toEqual(['/kurse/rad-yoga/'])
    expect(resolveNewCourses(homeCopy.newInStudio.items, COURSES.slice(0, 1))).toEqual([])
  })

  it('NewInStudio links each teaser and renders nothing without any', () => {
    const props = {
      eyebrow: homeCopy.newInStudio.eyebrow,
      heading: homeCopy.newInStudio.heading,
      linkLabel: 'Zum Kurs',
      images: copyImages(),
      headingId: 'new-courses-heading',
    }
    const teasers = resolveNewCourses(homeCopy.newInStudio.items, COURSES)
    const { rerender, container } = render(<NewInStudio {...props} teasers={teasers} />)
    expect(screen.getByRole('heading', { level: 2 })).toHaveAttribute('id', 'new-courses-heading')
    expect(screen.getByRole('link')).toHaveAttribute('href', '/kurse/rad-yoga/')

    rerender(<NewInStudio {...props} teasers={[]} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('HomeHero renders the h1, lead and preloaded photo', () => {
    render(
      <HomeHero
        eyebrow="Hatha Yoga Studio in Essen-Borbeck"
        heading={{ text: 'Ein gesunder Geist in einem', accent: 'gesunden Körper.' }}
        lead="Yoga-Kurse für jedes Alter."
        image={imageData({ alt: 'Liudmyla am Fenster' })}
        groupUrl={GROUP_URL}
        contact={contact}
      />,
    )
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'Ein gesunder Geist in einem gesunden Körper.',
    )
    expect(screen.getByRole('img', { name: 'Liudmyla am Fenster' })).toHaveAttribute('data-preload')
  })
})
