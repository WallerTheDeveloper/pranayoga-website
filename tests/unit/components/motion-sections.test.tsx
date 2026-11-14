import { act, render, screen, within } from '@testing-library/react'
import { renderToString } from 'react-dom/server'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const navigation = vi.hoisted(() => ({ pathname: '/' as string | null }))
vi.mock('next/navigation', () => ({ usePathname: () => navigation.pathname }))

const { ScrollReveal, REVEAL_MAX_STEPS, revealDelay } =
  await import('@/components/motion/ScrollReveal')
const { INTRO_CLASS_MS, INTRO_SCRIPT, IntroLoader } =
  await import('@/components/motion/IntroLoader')
const { PageTransition } = await import('@/components/motion/PageTransition')
const { ReloadLink } = await import('@/components/status/ReloadLink')
const { MobileMenu } = await import('@/components/layout/MobileMenu')
const Training = await import('@/components/teacherTraining/TrainingSections')
const { AboutStory, PhilosophyQuote } = await import('@/components/about/AboutSections')
const { SealList } = await import('@/components/blocks/SealList')
const { WhatsAppBand } = await import('@/components/blocks/WhatsAppBand')
const { Button } = await import('@/components/ui/Button')
const { Chip } = await import('@/components/ui/Chip')

import type { TeacherTrainingPageView } from '@/content/types'

import { copyImages, imageData, settingsView } from '../../fixtures/views'

let reducedMotion = false
let intersect: (entries: Partial<IntersectionObserverEntry>[]) => void = () => {}
const observed: Element[] = []

class FakeIntersectionObserver {
  constructor(callback: (entries: IntersectionObserverEntry[]) => void) {
    intersect = (entries) => callback(entries as IntersectionObserverEntry[])
  }
  observe(target: Element) {
    observed.push(target)
  }
  unobserve(target: Element) {
    observed.splice(observed.indexOf(target), 1)
  }
  disconnect() {
    observed.length = 0
  }
}

function setPageHeight(height: number) {
  Object.defineProperty(document.documentElement, 'scrollHeight', {
    value: height,
    configurable: true,
  })
}

const originalRect = HTMLElement.prototype.getBoundingClientRect

/** The block marked "top" sits on the first screen; every other block far below it. */
function layOutPage() {
  HTMLElement.prototype.getBoundingClientRect = function rect(this: HTMLElement) {
    const top = this.dataset.testid === 'top' ? 10 : 2000
    return { top, bottom: top + 100 } as DOMRect
  }
}

beforeEach(() => {
  reducedMotion = false
  observed.length = 0
  window.matchMedia = ((query: string) => ({
    matches: query.includes('reduce') && reducedMotion,
  })) as typeof window.matchMedia
  vi.stubGlobal('IntersectionObserver', FakeIntersectionObserver)
  document.documentElement.className = ''
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.useRealTimers()
  setPageHeight(0)
  HTMLElement.prototype.getBoundingClientRect = originalRect
})

function Page() {
  return (
    <>
      <div className="rv" data-testid="top" />
      <div className="rv" data-testid="below" />
      <ScrollReveal />
    </>
  )
}

describe('ScrollReveal', () => {
  it('staggers by 80 ms up to four steps', () => {
    expect([0, 1, 2, 3, 9].map(revealDelay)).toEqual(['0ms', '80ms', '160ms', '240ms', '240ms'])
    expect(REVEAL_MAX_STEPS).toBe(4)
  })

  it('reveals what is on screen at once and the rest as it scrolls into view', () => {
    setPageHeight(5000)
    layOutPage()
    render(<Page />)

    const below = screen.getByTestId('below')
    expect(screen.getByTestId('top')).toHaveClass('in')
    expect(below).not.toHaveClass('in')
    expect(document.documentElement).toHaveClass('rv-on')
    expect(observed).toEqual([below])

    act(() => intersect([{ target: below, isIntersecting: false }]))
    expect(below).not.toHaveClass('in')
    act(() => intersect([{ target: below, isIntersecting: true }]))
    expect(below).toHaveClass('in')
    expect(below.style.getPropertyValue('--rv-delay')).toBe('0ms')
    expect(observed).toEqual([])
  })

  it('hides nothing on a page that does not scroll', () => {
    setPageHeight(100)
    render(<Page />)
    expect(screen.getByTestId('below')).toHaveClass('in')
    expect(document.documentElement).not.toHaveClass('rv-on')
  })

  it('does nothing under reduced motion or without IntersectionObserver', () => {
    setPageHeight(5000)
    reducedMotion = true
    const { unmount } = render(<Page />)
    expect(document.documentElement).not.toHaveClass('rv-on')
    expect(screen.getByTestId('below')).not.toHaveClass('in')
    unmount()

    reducedMotion = false
    vi.stubGlobal('IntersectionObserver', undefined)
    render(<Page />)
    expect(document.documentElement).not.toHaveClass('rv-on')
  })

  it('switches off again when a new page starts', () => {
    setPageHeight(5000)
    navigation.pathname = '/'
    const { rerender } = render(<Page />)
    expect(document.documentElement).toHaveClass('rv-on')
    reducedMotion = true
    navigation.pathname = '/kontakt/'
    rerender(<Page />)
    expect(document.documentElement).not.toHaveClass('rv-on')
  })
})

describe('IntroLoader', () => {
  function runScript() {
    new Function(INTRO_SCRIPT)()
  }

  function setReferrer(value: string) {
    Object.defineProperty(document, 'referrer', { value, configurable: true })
  }

  afterEach(() => {
    setReferrer('')
  })

  it('renders the script and a hidden panel with the word', () => {
    const { container } = render(<IntroLoader word="Prana" />)
    expect(container.querySelector('script')?.innerHTML).toBe(INTRO_SCRIPT)
    const panel = container.querySelector('.intro-loader')
    expect(panel).toHaveAttribute('aria-hidden', 'true')
    expect(panel).toHaveTextContent('Prana')
  })

  it('marks a fresh visit, then clears the mark', () => {
    vi.useFakeTimers()
    runScript()
    expect(document.documentElement).toHaveClass('intro')
    vi.advanceTimersByTime(INTRO_CLASS_MS)
    expect(document.documentElement).not.toHaveClass('intro')
  })

  it('skips visits from this site, reloads and reduced motion', () => {
    setReferrer(`${window.location.origin}/kurse/`)
    runScript()
    expect(document.documentElement).not.toHaveClass('intro')

    setReferrer('https://www.google.com/')
    reducedMotion = true
    runScript()
    expect(document.documentElement).not.toHaveClass('intro')

    reducedMotion = false
    const entries = vi
      .spyOn(performance, 'getEntriesByType')
      .mockReturnValue([{ type: 'reload' } as unknown as PerformanceEntry])
    runScript()
    expect(document.documentElement).not.toHaveClass('intro')
    entries.mockRestore()
  })
})

describe('PageTransition and ReloadLink', () => {
  it('renders the page inside the transition', () => {
    render(
      <PageTransition>
        <p>Seite</p>
      </PageTransition>,
    )
    expect(screen.getByText('Seite')).toBeInTheDocument()
  })

  it('reloads the current address, or the home page without one', () => {
    navigation.pathname = '/kontakt/'
    const { rerender } = render(<ReloadLink />)
    expect(screen.getByRole('link', { name: 'Seite neu laden' })).toHaveAttribute(
      'href',
      '/kontakt/',
    )
    navigation.pathname = null
    rerender(<ReloadLink />)
    expect(screen.getByRole('link', { name: 'Seite neu laden' })).toHaveAttribute('href', '/')
  })
})

describe('MobileMenu without JavaScript', () => {
  it('links to the footer navigation until the page has hydrated', () => {
    const html = renderToString(
      <MobileMenu buttonLabel="Menü" dialogLabel="Menü" closeLabel="Menü schließen" logo={null}>
        <nav />
      </MobileMenu>,
    )
    expect(html).toMatch(/^<a [^>]*href="#footer-nav"/)
    expect(html).not.toContain('aria-expanded')
  })
})

function trainingView(overrides: Partial<TeacherTrainingPageView> = {}): TeacherTrainingPageView {
  return {
    startMonthLabel: 'März 2027',
    endMonthLabel: 'November 2027',
    priceLabel: '2.400 €',
    depositLabel: '500 €',
    depositDeadline: '14 Tage',
    balanceDeadline: '3 Monate',
    membershipDiscount: '10 % Rabatt',
    weekends: ['14.–15. März 2027', '11.–12. April 2027'],
    firstDayLabel: '14. März 2027',
    topics: [
      { title: 'Technik & Anatomie', text: 'Die Asanas.' },
      { title: 'Philosophie', text: null },
    ],
    requirements: ['Volle Teilnahme'],
    certification: 'Yoga Alliance RYT 200',
    flyer: {
      image: imageData({ width: 800, height: 1131 }),
      imageHref: '/api/media/file/flyer.png',
    },
    ...overrides,
  }
}

const EMPTY_TRAINING = trainingView({
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

describe('teacher-training sections', () => {
  it('shows the facts, with the price only when set', () => {
    const { rerender } = render(<Training.TrainingFacts training={trainingView()} />)
    expect(screen.getByText('2.400 €')).toBeInTheDocument()
    expect(screen.getByText('Deutsch, Russisch und Ukrainisch')).toBeInTheDocument()
    rerender(<Training.TrainingFacts training={EMPTY_TRAINING} />)
    expect(screen.queryByText('inklusive Arbeitsmaterial')).not.toBeInTheDocument()
  })

  it('numbers the topics and leaves the list out without any', () => {
    const { container, rerender } = render(
      <Training.TopicList training={trainingView()} headingId="topics" />,
    )
    expect(screen.getAllByRole('heading', { level: 3 }).map((h) => h.textContent)).toEqual([
      'Technik & Anatomie',
      'Philosophie',
    ])
    expect(screen.getByText(/zwei|2/i, { selector: 'p' })).toBeInTheDocument()
    rerender(<Training.TopicList training={EMPTY_TRAINING} headingId="topics" />)
    expect(container).toBeEmptyDOMElement()
  })

  it('lists the weekends, or says they follow', () => {
    const { rerender } = render(<Training.TrainingDates training={trainingView()} headingId="d" />)
    expect(screen.getByText('Start März 2027 · Abschluss November 2027')).toBeInTheDocument()
    expect(within(screen.getByRole('list')).getAllByRole('listitem')).toHaveLength(2)
    rerender(<Training.TrainingDates training={EMPTY_TRAINING} headingId="d" />)
    expect(screen.queryByRole('list')).not.toBeInTheDocument()
    expect(screen.getByText('Die genauen Termine geben wir bald bekannt.')).toBeInTheDocument()
  })

  it('shows the cost lines that are filled in', () => {
    const { rerender } = render(<Training.TrainingCosts training={trainingView()} headingId="c" />)
    expect(screen.getByText('500 €, fällig 14 Tage nach Anmeldung')).toBeInTheDocument()
    expect(screen.getByText('spätestens 3 Monate nach der Anzahlung')).toBeInTheDocument()
    expect(screen.getByText('10 % Rabatt')).toBeInTheDocument()
    rerender(<Training.TrainingCosts training={EMPTY_TRAINING} headingId="c" />)
    expect(screen.getAllByRole('term').map((term) => term.textContent)).toEqual(['Ratenzahlung'])
  })

  it('shows requirements and certification, always with the teacher line', () => {
    const { rerender } = render(
      <Training.TrainingRequirements training={trainingView()} headingId="r" />,
    )
    expect(screen.getByText('Volle Teilnahme')).toBeInTheDocument()
    expect(screen.getByText('Yoga Alliance RYT 200')).toBeInTheDocument()
    rerender(<Training.TrainingRequirements training={EMPTY_TRAINING} headingId="r" />)
    expect(screen.queryByRole('list')).not.toBeInTheDocument()
    expect(screen.getByText(/Liudmyla/)).toBeInTheDocument()
  })

  it('words the signup steps with and without deposit and first day', () => {
    const { rerender } = render(
      <Training.TrainingSignupSteps training={trainingView()} headingId="s" />,
    )
    expect(
      screen.getByText(/Anzahlung von 500 € fällig, spätestens 14 Tage danach/),
    ).toBeInTheDocument()
    expect(screen.getByText(/am 14\. März 2027\./)).toBeInTheDocument()
    rerender(
      <Training.TrainingSignupSteps
        training={trainingView({ depositDeadline: null })}
        headingId="s"
      />,
    )
    expect(screen.getByText(/Anzahlung von 500 € fällig\./)).toBeInTheDocument()
    rerender(<Training.TrainingSignupSteps training={EMPTY_TRAINING} headingId="s" />)
    expect(screen.getByText(/Liudmyla nennt Ihnen die Einzelheiten/)).toBeInTheDocument()
    expect(screen.getByText('Die Ausbildung beginnt am ersten Wochenende.')).toBeInTheDocument()
  })

  it('links the flyer PDF, else the image, and is left out without either', () => {
    const { container, rerender } = render(
      <Training.TrainingFlyer training={trainingView()} pdfHref="/api/downloads/file/flyer.pdf" />,
    )
    expect(screen.getByRole('link', { name: /Flyer öffnen/ })).toHaveAttribute(
      'href',
      '/api/downloads/file/flyer.pdf',
    )
    rerender(<Training.TrainingFlyer training={trainingView()} pdfHref={null} />)
    expect(screen.getByRole('link', { name: /Flyer öffnen/ })).toHaveAttribute(
      'href',
      '/api/media/file/flyer.png',
    )
    rerender(<Training.TrainingFlyer training={EMPTY_TRAINING} pdfHref={null} />)
    expect(container).toBeEmptyDOMElement()
    rerender(<Training.TrainingFlyer training={EMPTY_TRAINING} pdfHref="/x.pdf" />)
    expect(screen.getByRole('link', { name: /Flyer öffnen/ })).toBeInTheDocument()
  })

  it('shows the three teaching languages', () => {
    render(<Training.BilingualBlock headingId="b" />)
    expect(screen.getAllByRole('listitem').map((item) => item.textContent)).toEqual([
      'Deutsch',
      'Russisch',
      'Ukrainisch',
    ])
  })
})

describe('shared pieces with phase-3 options', () => {
  it('tells the story and the philosophy quote', () => {
    render(
      <>
        <AboutStory headingId="story" />
        <PhilosophyQuote headingId="quote" />
      </>,
    )
    expect(screen.getAllByRole('heading', { level: 2 })).toHaveLength(2)
    expect(screen.getByRole('figure')).toBeInTheDocument()
  })

  it('lists the seals, leaving out missing images', () => {
    render(<SealList images={copyImages(false)} />)
    expect(screen.getAllByRole('listitem')).toHaveLength(3)
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
  })

  it('lets a page replace the group button with another chat', () => {
    const { contact } = settingsView()
    render(
      <WhatsAppBand
        groupUrl={null}
        contact={contact}
        cta={{
          href: 'https://wa.me/491755830372',
          label: 'Fragen per WhatsApp',
          ariaLabel: 'Fragen per WhatsApp an Liudmyla',
        }}
      />,
    )
    expect(screen.getByRole('link', { name: 'Fragen per WhatsApp an Liudmyla' })).toHaveAttribute(
      'href',
      'https://wa.me/491755830372',
    )
  })

  it('renders plain anchors, icons and a busy state on buttons', () => {
    render(
      <>
        <Button href="/vertrag.pdf" plain icon={<svg data-testid="icon" />}>
          PDF
        </Button>
        <Button ariaDisabled>Senden</Button>
        <Chip href="/kurse/" internal icon={<svg data-testid="chip-icon" />} iconPosition="end">
          Kurse
        </Chip>
      </>,
    )
    expect(screen.getByRole('link', { name: 'PDF' })).toHaveAttribute('href', '/vertrag.pdf')
    expect(screen.getByTestId('icon')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Senden' })).toHaveAttribute('aria-disabled', 'true')
    const chip = screen.getByRole('link', { name: 'Kurse' })
    expect(chip).toHaveAttribute('href', '/kurse/')
    expect(chip.lastElementChild).toBe(screen.getByTestId('chip-icon'))
  })
})
