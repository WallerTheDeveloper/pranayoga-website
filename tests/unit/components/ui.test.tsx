import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { AdminValue, isFilled } from '@/components/ui/AdminValue'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Chip } from '@/components/ui/Chip'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { Heading } from '@/components/ui/Heading'
import { IconDisc } from '@/components/ui/IconDisc'
import { Section } from '@/components/ui/Section'
import { SocialButton } from '@/components/ui/SocialButton'
import { Tag } from '@/components/ui/Tag'
import { TextLink } from '@/components/ui/TextLink'
import { ContainedImage, TreatedImage } from '@/components/ui/TreatedImage'
import { WhatsAppButton } from '@/components/ui/WhatsAppButton'

import { imageData } from '../../fixtures/views'

describe('AdminValue', () => {
  it('treats empty strings, arrays and nullish values as not filled', () => {
    expect(isFilled('')).toBe(false)
    expect(isFilled('  ')).toBe(false)
    expect(isFilled([])).toBe(false)
    expect(isFilled(null)).toBe(false)
    expect(isFilled(undefined)).toBe(false)
    expect(isFilled(0)).toBe(true)
    expect(isFilled(['a'])).toBe(true)
  })

  it('renders children only for filled values', () => {
    const { container, rerender } = render(
      <AdminValue value={'0175 5830372'}>{(value) => <span>Tel. {value}</span>}</AdminValue>,
    )
    expect(screen.getByText('Tel. 0175 5830372')).toBeInTheDocument()
    rerender(<AdminValue value={''}>{(value) => <span>Tel. {value}</span>}</AdminValue>)
    expect(container).toBeEmptyDOMElement()
  })
})

describe('Heading', () => {
  it('renders the level, accent and trailing text', () => {
    render(
      <Heading as="h2" size="section" id="trial" accent="für" trailing="15 €">
        Probestunde
      </Heading>,
    )
    const heading = screen.getByRole('heading', { level: 2 })
    expect(heading).toHaveAttribute('id', 'trial')
    expect(heading).toHaveTextContent('Probestunde für 15 €')
    expect(heading.querySelector('em')).toHaveTextContent('für')
  })

  it('works without an accent', () => {
    render(
      <Heading as="h1" size="display" accentTone="moss">
        Hallo
      </Heading>,
    )
    expect(screen.getByRole('heading', { level: 1 }).querySelector('em')).toBeNull()
  })
})

describe('links and buttons', () => {
  it('WhatsAppButton opens a new tab safely with a spoken label', () => {
    render(
      <WhatsAppButton
        href="https://chat.whatsapp.com/abc"
        label="Termin über WhatsApp"
        ariaLabel="Termin über WhatsApp (öffnet WhatsApp)"
        size="bar"
        withArrow
      />,
    )
    const link = screen.getByRole('link', { name: 'Termin über WhatsApp (öffnet WhatsApp)' })
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
    expect(link).toHaveTextContent('Termin über WhatsApp')
  })

  it('Button renders a link with href and a button without', async () => {
    const onClick = vi.fn()
    render(
      <>
        <Button href="/kurse/" variant="outline" withArrow>
          Alle Kurse
        </Button>
        <Button onClick={onClick} variant="light">
          Senden
        </Button>
        <Button type="submit">Abschicken</Button>
      </>,
    )
    expect(screen.getByRole('link', { name: 'Alle Kurse' })).toHaveAttribute('href', '/kurse/')
    await userEvent.click(screen.getByRole('button', { name: 'Senden' }))
    expect(onClick).toHaveBeenCalledOnce()
    expect(screen.getByRole('button', { name: 'Senden' })).toHaveAttribute('type', 'button')
    expect(screen.getByRole('button', { name: 'Abschicken' })).toHaveAttribute('type', 'submit')
  })

  it('TextLink marks external links', () => {
    render(
      <>
        <TextLink href="/ueber-uns/">Mehr</TextLink>
        <TextLink href="https://g.page/x" external ariaLabel="Bewertungen (öffnet Google)">
          Bewertungen
        </TextLink>
      </>,
    )
    expect(screen.getByRole('link', { name: 'Mehr' })).not.toHaveAttribute('target')
    const external = screen.getByRole('link', { name: 'Bewertungen (öffnet Google)' })
    expect(external).toHaveAttribute('target', '_blank')
    expect(external).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('SocialButton names the platform and leaves the site safely', () => {
    render(
      <>
        <SocialButton platform="instagram" href="https://www.instagram.com/prana" size="small" />
        <SocialButton platform="facebook" href="https://www.facebook.com/prana" />
      </>,
    )
    expect(screen.getByRole('link', { name: /auf Instagram/ })).toHaveAttribute(
      'rel',
      'noopener noreferrer',
    )
    expect(screen.getByRole('link', { name: /auf Facebook/ })).toHaveTextContent('Facebook')
  })

  it('Chip and Card are plain links', () => {
    render(
      <>
        <Chip href="tel:+491755830372" icon={<span />} ariaLabel="Anrufen">
          0175 5830372
        </Chip>
        <Card href="/kurse/rad-yoga/">Rad Yoga</Card>
      </>,
    )
    expect(screen.getByRole('link', { name: 'Anrufen' })).toHaveAttribute(
      'href',
      'tel:+491755830372',
    )
    expect(screen.getByRole('link', { name: 'Rad Yoga' })).toHaveAttribute(
      'href',
      '/kurse/rad-yoga/',
    )
  })
})

describe('small parts', () => {
  it('Tag, Eyebrow and IconDisc render their content', () => {
    const { container } = render(
      <>
        <Tag tone="dark">Neu</Tag>
        <Tag>50 Plus</Tag>
        <Eyebrow onDark>Prana</Eyebrow>
        <IconDisc icon="wheel" size="small" />
      </>,
    )
    expect(screen.getByText('Neu')).toBeInTheDocument()
    expect(screen.getByText('Prana').tagName).toBe('P')
    const disc = container.querySelector('[data-disc]')
    expect(disc?.querySelector('svg')).toHaveAttribute('aria-hidden', 'true')
  })

  it('Section links its heading', () => {
    render(
      <Section tone="sand" paper flushTop flushBottom stack labelledBy="h">
        <h2 id="h">Kurse</h2>
      </Section>,
    )
    expect(screen.getByRole('region', { name: 'Kurse' })).toBeInTheDocument()
  })
})

describe('TreatedImage', () => {
  it('renders the image with its alt text and focal point', () => {
    render(<TreatedImage image={imageData()} sizes="440px" aspectRatio="3 / 4" preload />)
    const image = screen.getByRole('img', { name: 'Foto aus dem Studio' })
    expect(image).toHaveAttribute('sizes', '440px')
    expect(image).toHaveAttribute('data-preload')
    expect(image).toHaveStyle({ objectPosition: '50% 50%' })
  })

  it('lets the caller override the alt text', () => {
    const { container } = render(
      <ContainedImage image={imageData()} sizes="88px" alt="" zoom={false} />,
    )
    expect(container.querySelector('img')).toHaveAttribute('alt', '')
  })

  it('hides the empty placeholder from assistive tech', () => {
    const { container } = render(<TreatedImage image={null} sizes="440px" />)
    expect(container.firstChild).toHaveAttribute('aria-hidden', 'true')
    expect(container.querySelector('img')).toBeNull()
  })
})
