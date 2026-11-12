import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { CourseAudience } from '@/components/courses/CourseAudience'
import { CourseBenefits, groupBenefits } from '@/components/courses/CourseBenefits'
import { CourseCard, CourseGrid } from '@/components/courses/CourseCard'
import { CourseFaq } from '@/components/courses/CourseFaq'
import { CourseHero, priceLineText } from '@/components/courses/CourseHero'
import { CourseInfoCards } from '@/components/courses/CourseInfoCards'
import { CourseSchedule, CourseSchedulePanel } from '@/components/courses/CourseSchedule'
import { CourseSteps, stepNumber } from '@/components/courses/CourseSteps'
import { CourseTimesNote } from '@/components/courses/CourseTimesNote'
import { WhatYouNeed } from '@/components/courses/WhatYouNeed'
import { courseCopy } from '@/content/copy/course'
import type { CourseStep, ScheduleEntry } from '@/content/types'

import {
  COURSES,
  copyImages,
  courseDetail,
  courseSummary,
  imageData,
  settingsView,
} from '../../fixtures/views'

const contact = settingsView().contact
const GROUP_URL = 'https://chat.whatsapp.com/abc'

const step = (title: string, withImage = false): CourseStep => ({
  title,
  text: `${title} erklärt.`,
  image: withImage ? imageData({ alt: title }) : null,
})

const SCHEDULE: ScheduleEntry[] = [
  { weekday: 'monday', weekdayLabel: 'Montag', timeLabel: '18:00–19:30' },
  { weekday: 'thursday', weekdayLabel: 'Donnerstag', timeLabel: '09:30–11:00' },
]

describe('CourseCard', () => {
  it('plain: no photo and no audience line', () => {
    const { container } = render(<CourseCard course={courseSummary()} linkLabel="Mehr erfahren" />)
    expect(container.querySelector('img')).toBeNull()
    expect(container.querySelector('dl')).toBeNull()
    expect(screen.getByRole('link')).toHaveAttribute('href', '/kurse/hatha-yoga/')
  })

  it('photo: decorative photo on top and the "Für wen" line', () => {
    const { container } = render(
      <CourseCard
        course={courseSummary()}
        linkLabel="Mehr erfahren"
        variant="photo"
        audienceTerm="Für wen"
      />,
    )
    expect(container.querySelector('img')).toHaveAttribute('alt', '')
    expect(container.querySelector('dt')).toHaveTextContent('Für wen')
    expect(container.querySelector('dd')).toHaveTextContent('Für jeden geeignet')
  })

  it('photo: leaves out what is empty', () => {
    const { container } = render(
      <CourseCard
        course={courseSummary({ cardImage: null, audienceLabel: null })}
        linkLabel="Mehr erfahren"
        variant="photo"
        audienceTerm="Für wen"
      />,
    )
    expect(container.querySelector('img')).toBeNull()
    expect(container.querySelector('dl')).toBeNull()
  })

  it('grid renders one card per course', () => {
    render(<CourseGrid courses={COURSES} linkLabel="Mehr erfahren" variant="photo" />)
    expect(screen.getAllByRole('link')).toHaveLength(COURSES.length)
    expect(screen.getAllByRole('heading', { level: 3 }).map((h) => h.textContent)).toEqual([
      'Hatha Yoga',
      'Rad Yoga',
    ])
  })
})

describe('CourseHero', () => {
  it('formats the price line with and without a unit', () => {
    expect(priceLineText({ name: 'Yoga für Jugendliche', priceLabel: '45 €', unit: null })).toBe(
      'Yoga für Jugendliche: 45 €',
    )
    expect(priceLineText({ name: 'Zehnerkarte', priceLabel: '120 €', unit: '10 Stunden' })).toBe(
      'Zehnerkarte: 120 € 10 Stunden',
    )
  })

  it('shows breadcrumbs, the title as h1, the audience tag and the booking block', () => {
    render(<CourseHero course={courseDetail()} groupUrl={GROUP_URL} contact={contact} />)
    const crumbs = screen.getByRole('navigation', { name: 'Sie sind hier' })
    expect(within(crumbs).getByRole('link', { name: 'Kurse' })).toHaveAttribute('href', '/kurse/')
    expect(within(crumbs).getByText('Hatha Yoga')).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Hatha Yoga')
    expect(screen.getByText('Sanft und kräftigend')).toBeInTheDocument()
    expect(screen.getByText('Für jeden geeignet')).toBeInTheDocument()
    expect(screen.getByText(courseCopy.hero.hint)).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: courseCopy.hero.allPrices })).toBeNull()
  })

  it('uses the wide frame for a landscape photo and the narrow one for a portrait', () => {
    const { container, rerender } = render(
      <CourseHero course={courseDetail()} groupUrl={GROUP_URL} contact={contact} />,
    )
    expect(container.querySelector('img')).toHaveAttribute('data-preload', '')
    const landscape = container.querySelector('figure')?.className
    rerender(
      <CourseHero
        course={courseDetail({
          hero: { ...courseDetail().hero, image: imageData({ width: 600, height: 900 }) },
        })}
        groupUrl={GROUP_URL}
        contact={contact}
      />,
    )
    expect(container.querySelector('figure')?.className).not.toBe(landscape)
  })

  it('shows the linked price with a link to all prices', () => {
    const course = courseDetail({
      priceLine: { name: 'Yoga für Jugendliche', priceLabel: '45 €', unit: null },
      audienceLabel: null,
    })
    const { container } = render(
      <CourseHero course={course} groupUrl={GROUP_URL} contact={contact} />,
    )
    expect(screen.getByText('Yoga für Jugendliche: 45 €')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: courseCopy.hero.allPrices })).toHaveAttribute(
      'href',
      '/mitgliedschaft-preise/',
    )
    expect(container.querySelector('dl')).toBeNull()
  })

  it('works without photo, eyebrow and lead', () => {
    const course = courseDetail({
      hero: { eyebrow: null, lead: '', image: null, secondaryImage: null },
    })
    const { container } = render(<CourseHero course={course} groupUrl={null} contact={contact} />)
    expect(container.querySelector('figure')).toBeNull()
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Hatha Yoga')
  })
})

describe('CourseAudience', () => {
  const props = {
    eyebrow: courseCopy.audience.eyebrow,
    heading: 'Für wen ist der Kurs?',
    medicalNote: courseCopy.audience.medicalNote,
    headingId: 'audience-heading',
  }

  it('with a photo: photo, paragraphs and the medical note', () => {
    const { container } = render(
      <CourseAudience {...props} audience={courseDetail().audience} image={imageData()} />,
    )
    expect(screen.getByRole('heading', { level: 2 })).toHaveAttribute('id', 'audience-heading')
    expect(container.querySelector('img')).not.toBeNull()
    expect(screen.getByText('Für Einsteiger und Geübte.')).toBeInTheDocument()
    expect(screen.getByText(courseCopy.audience.medicalNote)).toBeInTheDocument()
    expect(container.querySelector('blockquote')).toBeNull()
  })

  it('without a photo, and with a quote', () => {
    const audience = { ...courseDetail().audience, quote: 'Klang ist Bewegung.' }
    const { container } = render(<CourseAudience {...props} audience={audience} image={null} />)
    expect(container.querySelector('img')).toBeNull()
    expect(container.querySelector('blockquote')).toHaveTextContent('Klang ist Bewegung.')
  })
})

describe('CourseSteps', () => {
  it('numbers with two digits', () => {
    expect(stepNumber(0)).toBe('01')
    expect(stepNumber(9)).toBe('10')
  })

  it('renders an ordered list of steps, photos only where set', () => {
    const { container } = render(
      <CourseSteps
        eyebrow="In der Stunde"
        heading="So läuft eine Stunde ab"
        items={[step('Atmung', true), step('Asanas')]}
        headingId="steps-heading"
      />,
    )
    const items = within(screen.getByRole('list')).getAllByRole('listitem')
    expect(items).toHaveLength(2)
    expect(within(items[0]!).getByRole('heading', { level: 3 })).toHaveTextContent('Atmung')
    expect(container.querySelectorAll('img')).toHaveLength(1)
    expect(within(items[1]!).getByText('02')).toHaveAttribute('aria-hidden', 'true')
  })

  it('renders nothing without steps', () => {
    const { container } = render(
      <CourseSteps eyebrow="In der Stunde" heading="Ablauf" items={[]} headingId="steps" />,
    )
    expect(container).toBeEmptyDOMElement()
  })
})

describe('CourseBenefits', () => {
  const props = { eyebrow: 'Wirkung', heading: 'Was es bewirkt', headingId: 'benefits-heading' }

  it('splits benefits by photo, keeping their order', () => {
    const items = [step('A', true), step('B'), step('C', true)]
    const { withPhoto, plain } = groupBenefits(items)
    expect(withPhoto.map((item) => item.title)).toEqual(['A', 'C'])
    expect(plain.map((item) => item.title)).toEqual(['B'])
  })

  it('photo cards and a ticked list', () => {
    const { container } = render(
      <CourseBenefits {...props} items={[step('Kraft', true), step('Ruhe')]} sideImage={null} />,
    )
    expect(screen.getAllByRole('list')).toHaveLength(2)
    expect(container.querySelectorAll('img')).toHaveLength(1)
    expect(screen.getAllByRole('heading', { level: 3 }).map((h) => h.textContent)).toEqual([
      'Kraft',
      'Ruhe',
    ])
  })

  it('a side image next to a ticked list', () => {
    const { container } = render(
      <CourseBenefits {...props} items={[step('Ruhe')]} sideImage={imageData({ alt: 'Rücken' })} />,
    )
    expect(screen.getAllByRole('list')).toHaveLength(1)
    expect(container.querySelector('img')).toHaveAttribute('alt', 'Rücken')
  })

  it('renders nothing without benefits', () => {
    const { container } = render(<CourseBenefits {...props} items={[]} sideImage={imageData()} />)
    expect(container).toBeEmptyDOMElement()
  })
})

describe('CourseSchedule', () => {
  it('lists weekday and time', () => {
    render(<CourseSchedule heading="Kurszeiten" entries={SCHEDULE} />)
    const rows = screen.getAllByRole('listitem')
    expect(rows).toHaveLength(2)
    expect(rows[0]).toHaveTextContent('Montag18:00–19:30')
  })

  it('renders nothing while no times are entered', () => {
    const { container } = render(<CourseSchedule heading="Kurszeiten" entries={[]} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('panel: schedule with the WhatsApp booking, or nothing', () => {
    const props = { heading: 'Kurszeiten', groupUrl: GROUP_URL, contact, hint: 'Hinweis' }
    render(<CourseSchedulePanel {...props} entries={SCHEDULE} />)
    expect(screen.getByText('Montag')).toBeInTheDocument()
    expect(screen.getByText('Hinweis')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Termin über WhatsApp/ })).toHaveAttribute(
      'href',
      GROUP_URL,
    )
    const { container } = render(<CourseSchedulePanel {...props} entries={[]} />)
    expect(container).toBeEmptyDOMElement()
  })
})

describe('CourseFaq', () => {
  it('heading and questions, the first open', () => {
    const { container } = render(
      <CourseFaq
        eyebrow="Fragen"
        heading="Häufige Fragen"
        faqs={courseDetail().faqs}
        headingId="faq-heading"
      />,
    )
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Häufige Fragen')
    const details = container.querySelectorAll('details')
    expect(details).toHaveLength(2)
    expect(details[0]).toHaveAttribute('open')
    expect(details[1]).not.toHaveAttribute('open')
  })

  it('renders nothing without questions', () => {
    const { container } = render(
      <CourseFaq eyebrow="Fragen" heading="Häufige Fragen" faqs={[]} headingId="faq" />,
    )
    expect(container).toBeEmptyDOMElement()
  })
})

describe('course page cards and notes', () => {
  it('info cards: what to bring and the compact teacher card', () => {
    render(
      <CourseInfoCards
        bringAlong={{ ...courseCopy.bringAlong, items: ['Eigene Yogamatte', 'Gute Laune'] }}
        images={copyImages()}
        headingId="bring-along-heading"
      />,
    )
    expect(screen.getByRole('heading', { level: 2 })).toHaveAttribute('id', 'bring-along-heading')
    expect(screen.getByText('Gute Laune')).toBeInTheDocument()
    expect(screen.getByText('Liudmyla Schiemann')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Mehr über Liudmyla' })).toHaveAttribute(
      'href',
      '/ueber-uns/',
    )
  })

  it('times note: with and without the group link', () => {
    const { rerender } = render(
      <CourseTimesNote heading="Kurszeiten" text="In der Gruppe." groupUrl={GROUP_URL} />,
    )
    expect(screen.getByRole('link')).toHaveAttribute('href', GROUP_URL)
    rerender(<CourseTimesNote heading="Kurszeiten" text="In der Gruppe." groupUrl={null} />)
    expect(screen.queryByRole('link')).toBeNull()
    expect(screen.getByText('In der Gruppe.')).toBeInTheDocument()
  })

  it('what you need: photo, heading and list', () => {
    render(
      <WhatYouNeed
        eyebrow="Gut zu wissen"
        heading="Was benötige ich?"
        intro="Nicht viel."
        items={['Eigene Yogamatte', 'Bequeme Kleidung']}
        image={imageData({ alt: 'Entspannt im Schneidersitz' })}
        headingId="bring-along-heading"
      />,
    )
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Was benötige ich?')
    expect(screen.getAllByRole('listitem')).toHaveLength(2)
    expect(screen.getByRole('img')).toHaveAttribute('alt', 'Entspannt im Schneidersitz')
  })
})
