import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderToString } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'

import { ContactForm, contactFieldId } from '@/components/forms/ContactForm'
import { ErrorSummary } from '@/components/forms/ErrorSummary'
import { SignupForm, signupFieldId } from '@/components/forms/SignupForm'
import { SubmitButton } from '@/components/forms/SubmitButton'
import type { SignupPlanGroup } from '@/content/types'
import { localIsoDate } from '@/lib/forms/fields'
import type { SubmitResult } from '@/lib/forms/submit'

const PLAN_GROUPS: SignupPlanGroup[] = [
  { label: 'Mitgliedschaft', plans: [{ id: 'block-1', label: '1× pro Woche – 59 € pro Monat' }] },
  { label: 'Karten', plans: [{ id: 'block-2', label: '10er-Karte – 150 €' }] },
]
const BANK = { bankName: 'Deutsche Bank', iban: 'DE11 3607 0024 0454 8384 01' }

function errorSummary() {
  return screen.getByRole('alert')
}

function change(label: string, value: string) {
  fireEvent.change(screen.getByLabelText(label, { exact: true }), { target: { value } })
}

function fillSignup() {
  change('Vor- und Nachname', 'Erika Mustermann')
  change('Geburtsdatum', '1990-04-12')
  change('Straße und Hausnummer', 'Musterweg 1')
  change('Postleitzahl', '45356')
  change('Ort', 'Essen')
  change('Telefonnummer', '0175 1234567')
  change('E-Mail', 'erika@example.test')
  change('Yoga-Abonnement', 'block-2')
  change('Beginn ab', localIsoDate())
  change('Kontoinhaber/in', 'Erika Mustermann')
  change('Kreditinstitut', 'Musterbank')
  change('IBAN', 'DE89 3704 0044 0532 0130 00')
  fireEvent.click(screen.getByRole('checkbox'))
}

function renderSignup(submit = vi.fn(() => Promise.resolve<SubmitResult>({ ok: true }))) {
  render(
    <SignupForm
      planGroups={PLAN_GROUPS}
      bank={BANK}
      groupUrl="https://chat.whatsapp.com/abc"
      submit={submit}
    />,
  )
  return submit
}

describe('SignupForm', () => {
  it('groups the plans in the select', () => {
    renderSignup()
    const select = screen.getByLabelText('Yoga-Abonnement', { exact: true })
    expect(within(select).getByRole('group', { name: 'Karten' })).toBeInTheDocument()
    expect(within(select).getByRole('option', { name: '10er-Karte – 150 €' })).toHaveValue(
      'block-2',
    )
  })

  it('shows nothing before the first submit, then every problem in a focused summary', async () => {
    const submit = renderSignup()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    fireEvent.submit(screen.getByRole('form', { name: 'Anmeldeformular' }))

    const summary = errorSummary()
    expect(summary).toHaveFocus()
    expect(summary).toHaveTextContent('Bitte prüfen Sie 13 Felder.')
    expect(within(summary).getAllByRole('link')).toHaveLength(13)
    expect(submit).not.toHaveBeenCalled()

    const name = screen.getByLabelText('Vor- und Nachname', { exact: true })
    expect(name).toHaveAttribute('aria-invalid', 'true')
    expect(name).toHaveAccessibleDescription('Bitte geben Sie Ihren Vor- und Nachnamen ein.')

    const link = within(summary).getByRole('link', { name: /^IBAN:/ })
    expect(link).toHaveAttribute('href', `#${signupFieldId('iban')}`)
    await userEvent.click(link)
    expect(screen.getByLabelText('IBAN', { exact: true })).toHaveFocus()
  })

  it('swaps the bank fields for the studio account when paying by transfer', async () => {
    renderSignup()
    expect(screen.getByLabelText('IBAN', { exact: true })).toBeInTheDocument()
    await userEvent.click(screen.getByRole('radio', { name: 'Überweisung' }))
    expect(screen.queryByLabelText('IBAN', { exact: true })).not.toBeInTheDocument()
    expect(screen.getByText('Bitte überweisen Sie an:')).toBeInTheDocument()
    expect(screen.getByText(BANK.iban)).toBeInTheDocument()
    expect(signupFieldId('payment')).toBe('signup-payment-direct-debit')
  })

  it('drops the bank fields from the summary once they are hidden', async () => {
    renderSignup()
    fireEvent.submit(screen.getByRole('form', { name: 'Anmeldeformular' }))
    expect(errorSummary()).toHaveTextContent('Bitte prüfen Sie 13 Felder.')
    await userEvent.click(screen.getByRole('radio', { name: 'Überweisung' }))
    expect(errorSummary()).toHaveTextContent('Bitte prüfen Sie 10 Felder.')
    expect(within(errorSummary()).queryByRole('link', { name: /^IBAN:/ })).not.toBeInTheDocument()
  })

  it('points to WhatsApp instead of a form nobody could send when no plan is offered', () => {
    render(<SignupForm planGroups={[]} bank={BANK} groupUrl="https://chat.whatsapp.com/abc" />)
    expect(screen.queryByRole('form')).not.toBeInTheDocument()
    const note = screen.getByRole('note')
    expect(note).toHaveTextContent(/Die Abonnements werden gerade aktualisiert/)
    expect(within(note).getByRole('link')).toHaveAttribute('href', 'https://chat.whatsapp.com/abc')
  })

  it('sends a complete signup and shows the thank-you message with the group link', async () => {
    const submit = renderSignup()
    fillSignup()
    fireEvent.submit(screen.getByRole('form', { name: 'Anmeldeformular' }))
    expect(screen.getByRole('button', { name: /Wird gesendet/ })).toHaveAttribute(
      'aria-disabled',
      'true',
    )
    const success = await screen.findByRole('status')
    expect(success).toHaveTextContent('Vielen Dank für Ihre Anmeldung!')
    expect(success).toHaveFocus()
    expect(within(success).getByRole('link')).toHaveAttribute(
      'href',
      'https://chat.whatsapp.com/abc',
    )
    expect(submit).toHaveBeenCalledWith(
      expect.objectContaining({ plan: 'block-2', consent: true, payment: 'direct-debit' }),
    )
  })

  it('keeps the form and says so when sending fails', async () => {
    renderSignup(vi.fn(() => Promise.reject(new Error('offline'))))
    fillSignup()
    fireEvent.submit(screen.getByRole('form', { name: 'Anmeldeformular' }))
    expect(await screen.findByRole('alert')).toHaveTextContent(/nicht geklappt|nicht gesendet/i)
    expect(screen.getByRole('form', { name: 'Anmeldeformular' })).toBeInTheDocument()
  })
})

describe('ContactForm', () => {
  function renderContact(result: SubmitResult = { ok: true }) {
    const submit = vi.fn(() => Promise.resolve(result))
    render(<ContactForm groupUrl={null} submit={submit} />)
    return submit
  }

  it('requires name, email and message', () => {
    renderContact()
    fireEvent.click(screen.getByRole('button', { name: /Nachricht senden/ }))
    expect(errorSummary()).toHaveTextContent('Bitte prüfen Sie 3 Felder.')
    expect(screen.getByLabelText('Telefon (optional)')).not.toHaveAttribute('aria-invalid', 'true')
    expect(contactFieldId('message')).toBe('contact-message')
  })

  it('sends a complete message', async () => {
    const submit = renderContact()
    change('Name', 'Erika')
    change('E-Mail', 'erika@example.test')
    change('Nachricht', 'Gibt es noch Plätze?')
    fireEvent.click(screen.getByRole('button', { name: /Nachricht senden/ }))
    expect(await screen.findByRole('status')).toHaveTextContent('Vielen Dank für Ihre Nachricht!')
    expect(submit).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Erika', phone: '', subject: '' }),
    )
  })

  it('reports a refused message', async () => {
    renderContact({ ok: false })
    change('Name', 'Erika')
    change('E-Mail', 'erika@example.test')
    change('Nachricht', 'Hallo')
    fireEvent.click(screen.getByRole('button', { name: /Nachricht senden/ }))
    await waitFor(() => expect(screen.getByRole('alert')).toBeInTheDocument())
    expect(screen.getByLabelText('Name', { exact: true })).toHaveValue('Erika')
  })
})

describe('ErrorSummary', () => {
  it('renders nothing without problems', () => {
    const { container } = render(<ErrorSummary items={[]} attempt={1} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('uses the singular for one field and leaves links to missing controls alone', async () => {
    render(
      <ErrorSummary items={[{ fieldId: 'gone', label: 'Ort', message: 'Fehlt' }]} attempt={1} />,
    )
    expect(errorSummary()).toHaveTextContent('Bitte prüfen Sie 1 Feld.')
    const link = screen.getByRole('link', { name: 'Ort: Fehlt' })
    await userEvent.click(link)
    expect(link).toHaveFocus()
  })

  it('takes focus again on every submit', () => {
    const items = [{ fieldId: 'ort', label: 'Ort', message: 'Fehlt' }]
    const { rerender } = render(
      <>
        <input id="ort" aria-label="Ort" />
        <ErrorSummary items={items} attempt={1} />
      </>,
    )
    screen.getByLabelText('Ort').focus()
    rerender(
      <>
        <input id="ort" aria-label="Ort" />
        <ErrorSummary items={items} attempt={2} />
      </>,
    )
    expect(errorSummary()).toHaveFocus()
  })
})

describe('SubmitButton', () => {
  it('is disabled in the server HTML and explains why without JavaScript', () => {
    const html = renderToString(<SubmitButton label="Senden" sending={false} />)
    expect(html).toMatch(/<button[^>]*disabled/)
    expect(html).toContain('<noscript>')
  })

  it('is enabled once hydrated and blocks a second press while sending', () => {
    const { rerender } = render(<SubmitButton label="Senden" sending={false} />)
    expect(screen.getByRole('button', { name: /Senden/ })).toBeEnabled()
    rerender(<SubmitButton label="Senden" sending />)
    const button = screen.getByRole('button', { name: /Wird gesendet/ })
    expect(button).toBeEnabled()
    expect(button).toHaveAttribute('aria-disabled', 'true')
  })
})
