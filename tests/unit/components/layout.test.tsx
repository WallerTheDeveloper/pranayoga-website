import { act, fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

const navigation = vi.hoisted(() => ({ pathname: '/', refresh: vi.fn() }))
vi.mock('next/navigation', () => ({
  usePathname: () => navigation.pathname,
  useRouter: () => ({ refresh: navigation.refresh }),
}))

const livePreview = vi.hoisted(() => ({
  props: null as null | { refresh: () => void; serverURL: string },
}))
vi.mock('@payloadcms/live-preview-react', () => ({
  RefreshRouteOnSave: (props: { refresh: () => void; serverURL: string }) => {
    livePreview.props = props
    return null
  },
}))

const { Breadcrumbs } = await import('@/components/layout/Breadcrumbs')
const { ContactBar } = await import('@/components/layout/ContactBar')
const { CoursesDropdown } = await import('@/components/layout/CoursesDropdown')
const { LivePreviewListener } = await import('@/components/layout/LivePreviewListener')
const { Logo, LogoLink } = await import('@/components/layout/Logo')
const { MobileActionBar } = await import('@/components/layout/MobileActionBar')
const { MobileMenu } = await import('@/components/layout/MobileMenu')
const { NavLink } = await import('@/components/layout/NavLink')
const { SiteFooter } = await import('@/components/layout/SiteFooter')
const { SiteHeader } = await import('@/components/layout/SiteHeader')

import { COURSES, settingsView } from '../../fixtures/views'

beforeAll(() => {
  // jsdom has <dialog> but not its modal API.
  const proto = HTMLDialogElement.prototype
  proto.showModal ??= function showModal(this: HTMLDialogElement) {
    this.setAttribute('open', '')
  }
  proto.close ??= function close(this: HTMLDialogElement) {
    if (!this.hasAttribute('open')) return
    this.removeAttribute('open')
    this.dispatchEvent(new Event('close'))
  }
})

beforeEach(() => {
  navigation.pathname = '/'
  navigation.refresh.mockReset()
})

describe('NavLink', () => {
  it('marks the exact page, also at the internal path', () => {
    navigation.pathname = '/pricing/'
    render(<NavLink href="/mitgliedschaft-preise/">Preise</NavLink>)
    expect(screen.getByRole('link')).toHaveAttribute('aria-current', 'page')
  })

  it('marks a section link on pages below it', () => {
    navigation.pathname = '/kurse/hatha-yoga/'
    render(
      <>
        <NavLink href="/kurse/" match="section" ariaExpanded={false} ariaControls="panel">
          Kurse
        </NavLink>
        <NavLink href="/kontakt/">Kontakt</NavLink>
      </>,
    )
    const courses = screen.getByRole('link', { name: 'Kurse' })
    expect(courses).toHaveAttribute('aria-current', 'true')
    expect(courses).toHaveAttribute('aria-expanded', 'false')
    expect(screen.getByRole('link', { name: 'Kontakt' })).not.toHaveAttribute('aria-current')
  })
})

describe('CoursesDropdown', () => {
  const renderDropdown = () =>
    render(
      <>
        <CoursesDropdown
          label="Kurse"
          href="/kurse/"
          courses={COURSES}
          hint="Kurszeiten in der WhatsApp-Gruppe"
          allCoursesLabel="Alle Kurse im Überblick"
        />
        <a href="/kontakt/">Kontakt</a>
      </>,
    )

  it('opens on keyboard focus and closes with Escape, keeping focus on the trigger', async () => {
    const user = userEvent.setup()
    renderDropdown()
    const trigger = screen.getByRole('link', { name: 'Kurse' })
    expect(trigger).toHaveAttribute('aria-expanded', 'false')

    await user.tab()
    expect(trigger).toHaveFocus()
    expect(trigger).toHaveAttribute('aria-expanded', 'true')

    await user.tab()
    expect(screen.getByRole('link', { name: /Hatha Yoga/ })).toHaveFocus()

    await user.keyboard('{Escape}')
    expect(trigger).toHaveFocus()
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
  })

  it('closes when focus leaves and on mouse leave', async () => {
    const user = userEvent.setup()
    renderDropdown()
    const trigger = screen.getByRole('link', { name: 'Kurse' })
    const root = trigger.parentElement!

    fireEvent.mouseEnter(root)
    expect(trigger).toHaveAttribute('aria-expanded', 'true')
    fireEvent.mouseLeave(root)
    expect(trigger).toHaveAttribute('aria-expanded', 'false')

    act(() => trigger.focus())
    expect(trigger).toHaveAttribute('aria-expanded', 'true')
    await user.click(screen.getByRole('link', { name: 'Kontakt' }))
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
  })

  it('lists every course and closes after navigation', () => {
    const { rerender } = renderDropdown()
    const trigger = screen.getByRole('link', { name: 'Kurse' })
    const panel = document.getElementById(trigger.getAttribute('aria-controls')!)!
    expect(within(panel).getAllByRole('listitem')).toHaveLength(2)
    expect(within(panel).getByText('Mit dem Yoga-Rad')).toBeInTheDocument()

    fireEvent.mouseEnter(trigger.parentElement!)
    navigation.pathname = '/kurse/rad-yoga/'
    rerender(
      <CoursesDropdown
        label="Kurse"
        href="/kurse/"
        courses={COURSES}
        hint="Kurszeiten in der WhatsApp-Gruppe"
        allCoursesLabel="Alle Kurse im Überblick"
      />,
    )
    expect(screen.getByRole('link', { name: 'Kurse' })).toHaveAttribute('aria-expanded', 'false')
  })

  it('closes a panel opened by hover with Escape, without moving focus', async () => {
    const user = userEvent.setup()
    renderDropdown()
    const trigger = screen.getByRole('link', { name: 'Kurse' })
    const outside = screen.getByRole('link', { name: 'Kontakt' })
    act(() => outside.focus())

    fireEvent.mouseEnter(trigger.parentElement!)
    expect(trigger).toHaveAttribute('aria-expanded', 'true')
    await user.keyboard('{Escape}')
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    expect(outside).toHaveFocus()
  })

  it('stays open on mouse leave while keyboard focus is inside', async () => {
    const user = userEvent.setup()
    renderDropdown()
    const trigger = screen.getByRole('link', { name: 'Kurse' })
    await user.tab()
    await user.tab()
    expect(screen.getByRole('link', { name: /Hatha Yoga/ })).toHaveFocus()

    fireEvent.mouseEnter(trigger.parentElement!)
    fireEvent.mouseLeave(trigger.parentElement!)
    expect(trigger).toHaveAttribute('aria-expanded', 'true')
  })

  it('removes its Escape listener once closed', () => {
    const removeSpy = vi.spyOn(document, 'removeEventListener')
    renderDropdown()
    const root = screen.getByRole('link', { name: 'Kurse' }).parentElement!
    fireEvent.mouseEnter(root)
    fireEvent.mouseLeave(root)
    expect(removeSpy).toHaveBeenCalledWith('keydown', expect.any(Function))
    removeSpy.mockRestore()
  })

  it('ignores Escape while closed', async () => {
    const user = userEvent.setup()
    renderDropdown()
    const trigger = screen.getByRole('link', { name: 'Kurse' })
    fireEvent.keyDown(trigger, { key: 'Escape' })
    await user.keyboard('{Escape}')
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
  })
})

describe('MobileMenu', () => {
  const renderMenu = () =>
    render(
      <MobileMenu
        buttonLabel="Menü"
        dialogLabel="Menü"
        closeLabel="Menü schließen"
        logo={<span>Logo</span>}
      >
        <a href="/kontakt/">Kontakt</a>
        <p>Text</p>
      </MobileMenu>,
    )

  it('opens as a dialog and closes with the close button, returning focus', async () => {
    const user = userEvent.setup()
    renderMenu()
    const button = screen.getByRole('button', { name: 'Menü' })
    await user.click(button)
    expect(button).toHaveAttribute('aria-expanded', 'true')
    const dialog = document.getElementById(
      button.getAttribute('aria-controls')!,
    ) as HTMLDialogElement
    expect(dialog.open).toBe(true)

    await user.click(screen.getByRole('button', { name: 'Menü schließen' }))
    expect(dialog.open).toBe(false)
    expect(button).toHaveAttribute('aria-expanded', 'false')
    expect(button).toHaveFocus()
  })

  it('closes on any link click but not on other clicks', async () => {
    const user = userEvent.setup()
    renderMenu()
    const button = screen.getByRole('button', { name: 'Menü' })
    await user.click(button)
    const dialog = document.getElementById(
      button.getAttribute('aria-controls')!,
    ) as HTMLDialogElement

    await user.click(screen.getByText('Text'))
    expect(dialog.open).toBe(true)
    await user.click(screen.getByText('Kontakt'))
    expect(dialog.open).toBe(false)
  })

  it('closes when the route changes', async () => {
    const user = userEvent.setup()
    const { rerender } = renderMenu()
    const button = screen.getByRole('button', { name: 'Menü' })
    await user.click(button)
    const dialog = document.getElementById(
      button.getAttribute('aria-controls')!,
    ) as HTMLDialogElement
    expect(dialog.open).toBe(true)

    navigation.pathname = '/kontakt/'
    rerender(
      <MobileMenu buttonLabel="Menü" dialogLabel="Menü" closeLabel="Menü schließen" logo={null}>
        <p>Text</p>
      </MobileMenu>,
    )
    expect(dialog.open).toBe(false)
  })
})

describe('MobileActionBar', () => {
  const settings = settingsView()

  it('books through the group and offers call and email', () => {
    render(
      <MobileActionBar
        groupUrl={settings.whatsApp.groupUrl}
        personalChatUrl={settings.whatsApp.personalChatUrl}
        contact={settings.contact}
      />,
    )
    const bar = screen.getByRole('region', { name: 'Kontakt' })
    expect(within(bar).getByRole('link', { name: /Termin über WhatsApp/ })).toHaveAttribute(
      'href',
      'https://chat.whatsapp.com/abc',
    )
    expect(within(bar).getByRole('link', { name: 'Anrufen: 0175 5830372' })).toBeInTheDocument()
    expect(
      within(bar).getByRole('link', { name: 'E-Mail an info@pranayogastudio.de' }),
    ).toBeInTheDocument()
  })

  it('opens the personal chat on the teacher-training page', () => {
    navigation.pathname = '/teacher-training/'
    render(
      <MobileActionBar
        groupUrl={settings.whatsApp.groupUrl}
        personalChatUrl={settings.whatsApp.personalChatUrl}
        contact={settings.contact}
      />,
    )
    expect(screen.getByRole('link', { name: /^Persönlich schreiben/ })).toHaveAttribute(
      'href',
      'https://wa.me/491755830372',
    )
  })

  it('renders nothing without any way to get in touch', () => {
    const empty = { ...settings.contact, phoneHref: null, emailHref: null }
    const { container } = render(
      <MobileActionBar groupUrl={null} personalChatUrl={null} contact={empty} />,
    )
    expect(container).toBeEmptyDOMElement()
  })
})

describe('ContactBar and SiteFooter', () => {
  it('ContactBar shows phone, email, address and socials', () => {
    render(<ContactBar settings={settingsView()} />)
    expect(screen.getByRole('link', { name: /0175 5830372/ })).toHaveAttribute(
      'href',
      'tel:+491755830372',
    )
    expect(screen.getByText('Weidkamp 176, 45356 Essen-Borbeck')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /auf Instagram/ })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /auf Facebook/ })).toBeNull()
  })

  it('ContactBar hides empty values', () => {
    const { container } = render(
      <ContactBar settings={settingsView({ contact: undefined, social: undefined })} />,
    )
    expect(container.querySelectorAll('a')).toHaveLength(0)
  })

  it('SiteFooter lists contact, courses, studio and legal links', () => {
    render(<SiteFooter settings={settingsView()} courses={COURSES} year={2026} />)
    expect(screen.getByRole('link', { name: 'WhatsApp-Gruppe (öffnet WhatsApp)' })).toHaveAttribute(
      'target',
      '_blank',
    )
    const courses = screen.getByRole('navigation', { name: 'Kurse' })
    expect(within(courses).getAllByRole('link')).toHaveLength(2)
    expect(screen.getByRole('link', { name: 'Impressum' })).toHaveAttribute('href', '/impressum/')
    expect(screen.getByText(/© 2026 Prana Yoga Studio Essen/)).toBeInTheDocument()
    expect(screen.queryByText('Cookie-Einstellungen')).toBeNull()
  })

  it('SiteFooter without courses, address or socials', () => {
    render(
      <SiteFooter
        settings={settingsView({ contact: undefined, social: undefined, whatsApp: undefined })}
        courses={[]}
        year={2026}
      />,
    )
    expect(screen.queryByRole('navigation', { name: 'Kurse' })).toBeNull()
    expect(document.querySelector('address')).toBeNull()
  })
})

describe('SiteHeader', () => {
  it('renders the logo, main nav, dropdown and mobile menu', () => {
    render(<SiteHeader settings={settingsView()} courses={COURSES} />)
    const nav = screen.getByRole('navigation', { name: 'Hauptmenü' })
    expect(within(nav).getByRole('link', { name: 'Kurse' })).toHaveAttribute('href', '/kurse/')
    expect(screen.getAllByRole('link', { name: /zur Startseite/ }).length).toBeGreaterThan(0)
    expect(screen.getByRole('button', { name: 'Menü' })).toBeInTheDocument()
  })

  it('drops the header CTA without a group link', () => {
    render(<SiteHeader settings={settingsView({ whatsApp: undefined })} courses={COURSES} />)
    expect(screen.queryByRole('link', { name: /Termin über WhatsApp/ })).toBeNull()
  })
})

describe('small layout parts', () => {
  it('Breadcrumbs end with the current page', () => {
    render(<Breadcrumbs items={[{ label: 'Kurse', href: '/kurse/' }, { label: 'Hatha Yoga' }]} />)
    const nav = screen.getByRole('navigation', { name: 'Sie sind hier' })
    expect(within(nav).getByRole('link', { name: 'Startseite' })).toHaveAttribute('href', '/')
    expect(within(nav).getByText('Hatha Yoga')).toHaveAttribute('aria-current', 'page')
  })

  it('Logo renders the SVG with its intrinsic size', () => {
    render(
      <>
        <Logo variant="stacked" alt="Prana" />
        <LogoLink alt="Zur Startseite" preload />
      </>,
    )
    expect(screen.getByRole('img', { name: 'Prana' })).toHaveAttribute('width', '472')
    expect(screen.getByRole('link', { name: 'Zur Startseite' })).toHaveAttribute('href', '/')
  })

  it('LivePreviewListener refreshes the route on save', () => {
    render(<LivePreviewListener serverURL="http://localhost:3000" />)
    expect(livePreview.props?.serverURL).toBe('http://localhost:3000')
    act(() => livePreview.props?.refresh())
    expect(navigation.refresh).toHaveBeenCalledOnce()
  })
})
