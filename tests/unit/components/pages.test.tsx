import { act, fireEvent, render, screen, within } from '@testing-library/react'
import { renderToString } from 'react-dom/server'
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'

import { CertificateGallery, stepIndex } from '@/components/about/CertificateGallery'
import { StudioLocation, TravelGallery } from '@/components/about/AboutSections'
import { ContactDetails } from '@/components/contact/ContactDetails'
import { MapConsent, routeUrl } from '@/components/contact/MapConsent'
import { LegalPage } from '@/components/legal/LegalPage'
import { LegalText } from '@/components/legal/LegalText'
import { ProviderCard } from '@/components/legal/ProviderCard'
import { COPIED_RESET_MS, IbanCopyButton } from '@/components/pricing/IbanCopyButton'
import { PriceGroupBlock } from '@/components/pricing/PriceGroupBlock'
import { SignupWays } from '@/components/pricing/SignupWays'
import { SignupAside } from '@/components/signup/SignupAside'
import { StatusPage } from '@/components/status/StatusPage'
import { toPriceGroup } from '@/content/mappers/prices'
import type { BusinessSettingsView, RichTextData } from '@/content/types'

import { priceBlock, priceGroupDoc } from '../../fixtures/docs'
import { imageData, settingsView } from '../../fixtures/views'

beforeAll(() => {
  // jsdom has no modal dialogs: open and close by attribute, and fire "close" like a browser.
  HTMLDialogElement.prototype.showModal ??= function showModal(this: HTMLDialogElement) {
    this.setAttribute('open', '')
  }
  HTMLDialogElement.prototype.close = function close(this: HTMLDialogElement) {
    this.removeAttribute('open')
    this.dispatchEvent(new Event('close'))
  }
})

afterEach(() => {
  vi.useRealTimers()
})

describe('CertificateGallery', () => {
  const certificates = [1, 2, 3].map((number) => ({
    image: imageData({ src: `/api/media/file/cert-${number}.jpg`, alt: `Zertifikat ${number}` }),
    caption: `Ausbildung ${number}`,
  }))

  function lightbox() {
    return screen.getByRole('dialog', { hidden: true })
  }

  it('wraps around at both ends', () => {
    expect(stepIndex(2, 1, 3)).toBe(0)
    expect(stepIndex(0, -1, 3)).toBe(2)
    expect(stepIndex(1, 1, 3)).toBe(2)
  })

  it('opens the lightbox on a thumbnail and pages with the arrow keys and buttons', () => {
    render(<CertificateGallery certificates={certificates} />)
    const openers = screen.getAllByRole('button', { name: /^Vergrößern: / })
    expect(openers).toHaveLength(3)
    expect(openers[1]).toHaveAttribute('aria-haspopup', 'dialog')

    fireEvent.click(openers[1]!)
    const dialog = lightbox()
    expect(dialog).toHaveAttribute('open')
    expect(dialog).toHaveTextContent('Zertifikat 2 von 3')
    expect(within(dialog).getByRole('button', { name: 'Schließen' })).toHaveFocus()

    fireEvent.keyDown(dialog, { key: 'ArrowRight' })
    expect(dialog).toHaveTextContent('Zertifikat 3 von 3')
    fireEvent.keyDown(dialog, { key: 'ArrowRight' })
    expect(dialog).toHaveTextContent('Zertifikat 1 von 3')
    fireEvent.keyDown(dialog, { key: 'ArrowLeft' })
    expect(dialog).toHaveTextContent('Zertifikat 3 von 3')
    fireEvent.keyDown(dialog, { key: 'Enter' })
    expect(dialog).toHaveTextContent('Zertifikat 3 von 3')
    fireEvent.click(within(dialog).getByRole('button', { name: 'Zurück' }))
    expect(dialog).toHaveTextContent('Ausbildung 2')
    fireEvent.click(within(dialog).getByRole('button', { name: 'Weiter' }))
    expect(within(dialog).getByRole('img')).toHaveAttribute('alt', 'Zertifikat 3')
  })

  it('closes on the button and the backdrop and returns focus to the thumbnail', () => {
    render(<CertificateGallery certificates={certificates} />)
    const opener = screen.getAllByRole('button', { name: /^Vergrößern: / })[0]!
    fireEvent.click(opener)
    fireEvent.click(within(lightbox()).getByRole('button', { name: 'Schließen' }))
    expect(lightbox()).not.toHaveAttribute('open')
    expect(opener).toHaveFocus()

    fireEvent.click(opener)
    fireEvent.click(within(lightbox()).getByText('Ausbildung 1', { selector: 'p' }))
    expect(lightbox()).toHaveAttribute('open')
    fireEvent.click(lightbox())
    expect(lightbox()).not.toHaveAttribute('open')
  })

  it('has no paging for a single certificate', () => {
    render(<CertificateGallery certificates={certificates.slice(0, 1)} />)
    fireEvent.click(screen.getByRole('button', { name: /^Vergrößern: / }))
    expect(within(lightbox()).queryByRole('button', { name: 'Weiter' })).not.toBeInTheDocument()
  })
})

describe('IbanCopyButton', () => {
  function stubClipboard(writeText: (text: string) => Promise<void>) {
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true })
  }

  it('is not in the server HTML: it would do nothing before hydration', () => {
    expect(renderToString(<IbanCopyButton iban="DE11 3607" />)).toBe('')
  })

  it('copies without spaces, confirms, then resets', async () => {
    vi.useFakeTimers()
    const writeText = vi.fn(() => Promise.resolve())
    stubClipboard(writeText)
    render(<IbanCopyButton iban="DE11 3607 0024 0454 8384 01" />)

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'IBAN kopieren' }))
    })
    expect(writeText).toHaveBeenCalledWith('DE11360700240454838401')
    expect(screen.getByRole('button', { name: 'Kopiert' })).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent(
      'Die IBAN wurde in die Zwischenablage kopiert.',
    )

    act(() => {
      vi.advanceTimersByTime(COPIED_RESET_MS)
    })
    expect(screen.getByRole('button', { name: 'IBAN kopieren' })).toBeInTheDocument()
    expect(screen.getByRole('status')).toBeEmptyDOMElement()
  })

  it('says so when the browser refuses the clipboard, then clears the message', async () => {
    vi.useFakeTimers()
    stubClipboard(() => Promise.reject(new Error('denied')))
    const { unmount } = render(<IbanCopyButton iban="DE11" />)
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'IBAN kopieren' }))
    })
    expect(screen.getByRole('status')).toHaveTextContent(/Kopieren hat nicht geklappt/)
    act(() => {
      vi.advanceTimersByTime(COPIED_RESET_MS)
    })
    expect(screen.getByRole('status')).toBeEmptyDOMElement()
    // A pending reset is cancelled when the button goes away.
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'IBAN kopieren' }))
    })
    unmount()
    expect(vi.getTimerCount()).toBe(0)
  })
})

describe('MapConsent', () => {
  const props = {
    embedUrl: 'https://www.google.com/maps/embed?pb=abc',
    address: 'Weidkamp 176, 45356 Essen-Borbeck',
    privacyHref: '/datenschutz/',
  }

  it('builds a directions link for the address', () => {
    expect(routeUrl('Weidkamp 176, Essen')).toBe(
      'https://www.google.com/maps/dir/?api=1&destination=Weidkamp%20176%2C%20Essen',
    )
  })

  it('loads nothing from Google until "Karte laden" is pressed', () => {
    const { container } = render(<MapConsent {...props} />)
    expect(container.querySelector('iframe')).toBeNull()
    expect(screen.getByText(/Daten an Google übertragen/)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Datenschutzerklärung/ })).toHaveAttribute(
      'href',
      '/datenschutz/',
    )

    fireEvent.click(screen.getByRole('button', { name: 'Karte laden' }))
    const frame = container.querySelector('iframe')
    expect(frame).toHaveAttribute('src', props.embedUrl)
    expect(frame?.getAttribute('title')).toContain('Weidkamp 176')
  })

  it('offers only the route link without an embed address or before hydration', () => {
    expect(renderToString(<MapConsent {...props} />)).not.toContain('Karte laden')
    render(<MapConsent {...props} embedUrl={null} />)
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
    expect(screen.queryByText(/Daten an Google/)).not.toBeInTheDocument()
    const route = screen.getByRole('link', { name: 'Route planen (öffnet Google Maps)' })
    expect(route).toHaveAttribute('href', routeUrl(props.address))
    expect(route).toHaveAttribute('target', '_blank')
    expect(route).toHaveAttribute('rel', 'noopener noreferrer')
  })
})

describe('StatusPage', () => {
  it('shows what happened and four ways back', () => {
    render(
      <StatusPage
        eyebrow="Fehler 404"
        heading={{ text: 'Diese Seite gibt es', accent: 'nicht (mehr).' }}
        lead="Vielleicht hat sich die Adresse geändert."
        mark="404"
      >
        <p>Extra</p>
      </StatusPage>,
    )
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'Diese Seite gibt es nicht (mehr).',
    )
    const ways = screen.getByRole('navigation', { name: 'Wege zurück' })
    expect(
      within(ways)
        .getAllByRole('link')
        .map((link) => link.getAttribute('href')),
    ).toEqual(['/', '/kurse/', '/mitgliedschaft-preise/', '/kontakt/'])
    expect(screen.getByText('Extra')).toBeInTheDocument()
  })
})

const LINK_FIELDS = { linkType: 'custom', newTab: false }

function textNode(text: string) {
  return { type: 'text', version: 1, text, format: 0, detail: 0, mode: 'normal', style: '' }
}

function legalContent(): RichTextData {
  return {
    root: {
      type: 'root',
      version: 1,
      direction: 'ltr',
      format: '',
      indent: 0,
      children: [
        { type: 'heading', tag: 'h2', version: 1, children: [textNode('Kontakt')] },
        {
          type: 'paragraph',
          version: 1,
          children: [
            textNode('Schreiben Sie an '),
            {
              type: 'link',
              version: 3,
              fields: { ...LINK_FIELDS, url: 'mailto:info@pranayogastudio.de' },
              children: [textNode('info@pranayogastudio.de')],
            },
            textNode(' oder '),
            {
              type: 'link',
              version: 3,
              fields: { ...LINK_FIELDS, url: 'https://example.test/', newTab: true },
              children: [textNode('extern')],
            },
            textNode(' oder '),
            {
              type: 'autolink',
              version: 2,
              fields: { ...LINK_FIELDS, url: 'javascript:alert(1)' },
              children: [textNode('gefährlich')],
            },
          ],
        },
      ],
    },
  }
}

describe('legal pages', () => {
  it('renders the rich text with safe links only', () => {
    render(<LegalText content={legalContent()} />)
    expect(screen.getByRole('heading', { level: 2, name: 'Kontakt' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'info@pranayogastudio.de' })).toHaveAttribute(
      'href',
      'mailto:info@pranayogastudio.de',
    )
    const external = screen.getByRole('link', { name: 'extern' })
    expect(external).toHaveAttribute('target', '_blank')
    expect(external).toHaveAttribute('rel', 'noopener noreferrer')
    expect(screen.queryByRole('link', { name: 'gefährlich' })).not.toBeInTheDocument()
    expect(screen.getByText('gefährlich')).toBeInTheDocument()
  })

  it('shows the date and the text, or a note while the text is pending', () => {
    const { rerender } = render(
      <LegalPage
        breadcrumb="Impressum"
        heading="Impressum"
        page={{ updatedOnLabel: '12. November 2026', content: legalContent() }}
      >
        <p>Anbieterin</p>
      </LegalPage>,
    )
    expect(screen.getByRole('heading', { level: 1, name: 'Impressum' })).toBeInTheDocument()
    expect(screen.getByText('Stand: 12. November 2026')).toBeInTheDocument()
    expect(screen.getByText('Anbieterin')).toBeInTheDocument()
    expect(screen.queryByText(/wird gerade überarbeitet/)).not.toBeInTheDocument()

    rerender(
      <LegalPage
        breadcrumb="Impressum"
        heading="Impressum"
        page={{ updatedOnLabel: null, content: null }}
      />,
    )
    expect(screen.queryByText(/^Stand:/)).not.toBeInTheDocument()
    expect(screen.getByText(/wird gerade überarbeitet/)).toBeInTheDocument()
  })

  it('names the provider with the admin contact details', () => {
    const { contact } = settingsView()
    const { rerender } = render(<ProviderCard contact={contact} />)
    const card = screen.getByRole('group', { name: 'Anbieterin' })
    expect(card).toHaveTextContent('Weidkamp 176, 45356 Essen-Borbeck')
    expect(within(card).getByRole('link', { name: '0175 5830372' })).toHaveAttribute(
      'href',
      'tel:+491755830372',
    )
    rerender(
      <ProviderCard
        contact={{ ...contact, phoneHref: null, emailHref: null, street: null, cityLine: null }}
      />,
    )
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
    expect(screen.getByRole('group', { name: 'Anbieterin' })).toHaveTextContent(
      'Liudmyla Schiemann',
    )
  })
})

describe('pricing', () => {
  const group = toPriceGroup(
    priceGroupDoc({
      blocks: [
        priceBlock({ id: 'a', name: '1× pro Woche', badge: 'popular', highlighted: true }),
        priceBlock({
          id: 'b',
          name: 'Probestunde',
          price: null,
          action: 'whatsapp',
          inclusions: [],
        }),
      ],
    }),
  )!

  it('shows each block with price, badge and the right action', () => {
    render(<PriceGroupBlock group={group} groupUrl="https://chat.whatsapp.com/abc" />)
    const section = screen.getByRole('region', { name: 'Regelmäßig üben' })
    const cards = within(section).getAllByRole('article')
    expect(cards).toHaveLength(2)
    expect(cards[0]).toHaveTextContent('Beliebt')
    expect(
      within(cards[0]!).getByRole('link', { name: 'Online anmelden: 1× pro Woche' }),
    ).toHaveAttribute('href', '/anmeldeformular/')
    expect(within(cards[0]!).getByRole('list', { name: 'Enthalten' })).toBeInTheDocument()
    expect(cards[1]).toHaveTextContent('Preis auf Anfrage')
    expect(within(cards[1]!).getByRole('link')).toHaveAttribute(
      'href',
      'https://chat.whatsapp.com/abc',
    )
  })

  it('leaves out the WhatsApp action without a group link', () => {
    render(<PriceGroupBlock group={group} groupUrl={null} />)
    expect(within(screen.getAllByRole('article')[1]!).queryByRole('link')).not.toBeInTheDocument()
  })

  const bank: BusinessSettingsView['bank'] = {
    accountHolder: 'Liudmyla Schiemann',
    bankName: 'Deutsche Bank',
    iban: 'DE11 3607 0024 0454 8384 01',
    paymentReference: 'Name + Monat',
  }

  it('offers three ways with contract and bank details', () => {
    render(
      <SignupWays
        contract={{ title: 'Vertrag', href: '/api/downloads/file/vertrag.pdf?v=1' }}
        bank={bank}
        headingId="ways"
      />,
    )
    expect(screen.getByText(/^Drei Wege/)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Vertrag herunterladen/ })).toHaveAttribute(
      'href',
      '/api/downloads/file/vertrag.pdf?v=1',
    )
    expect(screen.getByText('Liudmyla Schiemann')).toBeInTheDocument()
    expect(screen.getByText('Name + Monat')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'IBAN kopieren' })).toBeInTheDocument()
  })

  it('falls back to the online form alone', () => {
    render(
      <SignupWays
        contract={null}
        bank={{ accountHolder: null, bankName: null, iban: null, paymentReference: null }}
        headingId="ways"
      />,
    )
    expect(screen.getAllByRole('listitem')).toHaveLength(1)
    expect(screen.getByText(/^Füllen Sie das Formular aus/)).toBeInTheDocument()
  })
})

describe('signup aside and contact details', () => {
  it('offers WhatsApp, phone and email next to the form', () => {
    const settings = settingsView()
    render(<SignupAside groupUrl={settings.whatsApp.groupUrl} contact={settings.contact} />)
    expect(screen.getByRole('link', { name: 'Zu den Preisen' })).toHaveAttribute(
      'href',
      '/mitgliedschaft-preise/',
    )
    expect(screen.getByRole('link', { name: /0175 5830372/ })).toHaveAttribute(
      'href',
      'tel:+491755830372',
    )
  })

  it('hides the direct-contact block when nothing is set', () => {
    const { contact } = settingsView()
    render(
      <SignupAside groupUrl={null} contact={{ ...contact, phoneHref: null, emailHref: null }} />,
    )
    expect(screen.queryByText('Lieber direkt fragen?')).not.toBeInTheDocument()
  })

  it('lists phone, email, address and the social links', () => {
    render(<ContactDetails settings={settingsView()} />)
    expect(screen.getByRole('link', { name: '0175 5830372' })).toHaveAttribute(
      'href',
      'tel:+491755830372',
    )
    expect(screen.getByRole('link', { name: 'info@pranayogastudio.de' })).toHaveAttribute(
      'href',
      'mailto:info@pranayogastudio.de',
    )
    expect(screen.getByText(/45356 Essen-Borbeck/)).toBeInTheDocument()
    expect(screen.getByRole('group', { name: 'Soziale Netzwerke' })).toBeInTheDocument()
    expect(screen.getByText('WhatsApp-Gruppe')).toBeInTheDocument()
  })

  it('leaves out what the admin has not filled in', () => {
    const settings = settingsView({
      whatsApp: { groupUrl: '', personalChatUrl: '' },
      social: { instagramUrl: null, facebookUrl: null },
    })
    render(<ContactDetails settings={settings} />)
    expect(screen.queryByRole('group', { name: 'Soziale Netzwerke' })).not.toBeInTheDocument()
    expect(screen.queryByText('WhatsApp-Gruppe')).not.toBeInTheDocument()
  })
})

describe('about sections', () => {
  it('shows only the travel photos that exist', () => {
    render(
      <TravelGallery images={[imageData(), null, imageData({ src: '/b.jpg' })]} headingId="t" />,
    )
    expect(screen.getAllByRole('img')).toHaveLength(2)
  })

  it('names the studio by its address, or by the brand without one', () => {
    const { contact } = settingsView()
    const { rerender } = render(<StudioLocation contact={contact} image={null} headingId="s" />)
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(
      'Weidkamp 176, Essen-Borbeck',
    )
    rerender(
      <StudioLocation
        contact={{ ...contact, street: null, cityLine: null }}
        image={null}
        headingId="s"
      />,
    )
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Prana Yoga Studio')
  })
})
