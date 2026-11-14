import { expect, test, type Page } from '@playwright/test'

/**
 * Anmeldeformular and Kontakt (UI only until launch): validation on submit, an error summary that
 * takes focus and links to each field, and the thank-you message in place of the form.
 */

function summary(page: Page) {
  // Next's route announcer is an alert too, so pick the summary by its text.
  return page.getByRole('alert').filter({ hasText: 'Bitte prüfen Sie' })
}

/** A date a week from now, as a date input expects it. */
function nextWeek(): string {
  return new Date(Date.now() + 7 * 86_400_000).toISOString().slice(0, 10)
}

async function fillPersonalDetails(page: Page): Promise<void> {
  await page.getByLabel('Vor- und Nachname', { exact: true }).fill('Erika Mustermann')
  await page.getByLabel('Geburtsdatum', { exact: true }).fill('1990-04-12')
  await page.getByLabel('Straße und Hausnummer', { exact: true }).fill('Musterweg 1')
  await page.getByLabel('Postleitzahl', { exact: true }).fill('45356')
  await page.getByLabel('Ort', { exact: true }).fill('Essen')
  await page.getByLabel('Telefonnummer', { exact: true }).fill('0175 1234567')
  await page.getByLabel('E-Mail', { exact: true }).fill('erika@example.test')
  await page.getByLabel('Yoga-Abonnement', { exact: true }).selectOption({ index: 1 })
  await page.getByLabel('Beginn ab', { exact: true }).fill(nextWeek())
  await page.getByRole('checkbox', { name: /Ich erkläre mich damit einverstanden/ }).check()
}

test.describe('Anmeldeformular', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/anmeldeformular/')
    // The submit button is enabled once the form has hydrated.
    await expect(page.getByRole('button', { name: 'Anmeldung senden' })).toBeEnabled()
  })

  test('an empty submit lists every missing field and focuses the summary', async ({ page }) => {
    await page.getByRole('button', { name: 'Anmeldung senden' }).click()
    await expect(summary(page)).toBeFocused()
    await expect(summary(page)).toContainText('Bitte prüfen Sie 13 Felder.')
    await expect(summary(page).getByRole('link')).toHaveCount(13)

    await summary(page)
      .getByRole('link', { name: /^Vor- und Nachname:/ })
      .click()
    const name = page.getByLabel('Vor- und Nachname', { exact: true })
    await expect(name).toBeFocused()
    await expect(name).toHaveAttribute('aria-invalid', 'true')
    await expect(name).toHaveAccessibleDescription(/Bitte geben Sie Ihren Vor- und Nachnamen ein/)
  })

  test('the IBAN is checked; paying by transfer drops the bank fields', async ({ page }) => {
    await fillPersonalDetails(page)
    await page.getByLabel('Kontoinhaber/in', { exact: true }).fill('Erika Mustermann')
    await page.getByLabel('Kreditinstitut', { exact: true }).fill('Musterbank')
    await page.getByLabel('IBAN', { exact: true }).fill('DE11 3607 0024 0454 8384 02')
    await page.getByRole('button', { name: 'Anmeldung senden' }).click()

    await expect(summary(page)).toContainText('Bitte prüfen Sie 1 Feld.')
    await expect(summary(page)).toContainText('Diese IBAN ist nicht gültig')

    await page.getByRole('radio', { name: /Überweisung/ }).check()
    await expect(page.getByLabel('IBAN', { exact: true })).toHaveCount(0)
    await expect(page.getByText('Bitte überweisen Sie an:')).toBeVisible()
    await expect(page.getByText('DE11 3607 0024 0454 8384 01')).toBeVisible()
  })

  test('a complete signup shows the thank-you message in place of the form', async ({ page }) => {
    await fillPersonalDetails(page)
    await page.getByLabel('Kontoinhaber/in', { exact: true }).fill('Erika Mustermann')
    await page.getByLabel('Kreditinstitut', { exact: true }).fill('Musterbank')
    await page.getByLabel('IBAN', { exact: true }).fill('DE11 3607 0024 0454 8384 01')
    await page.getByRole('button', { name: 'Anmeldung senden' }).click()

    const success = page.getByRole('status').filter({ hasText: 'Vielen Dank für Ihre Anmeldung!' })
    await expect(success).toBeFocused()
    await expect(page.getByRole('form', { name: 'Anmeldeformular' })).toHaveCount(0)
  })
})

test.describe('Kontakt', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/kontakt/')
    await expect(page.getByRole('button', { name: 'Nachricht senden' })).toBeEnabled()
  })

  test('name, email and message are required; the email is checked', async ({ page }) => {
    const submit = page.getByRole('button', { name: 'Nachricht senden' })
    await submit.click()
    await expect(summary(page)).toBeFocused()
    await expect(summary(page)).toContainText('Bitte prüfen Sie 3 Felder.')

    await page.getByLabel('Name', { exact: true }).fill('Erika Mustermann')
    await page.getByLabel('E-Mail', { exact: true }).fill('erika@')
    await page.getByLabel('Nachricht', { exact: true }).fill('Gibt es noch Plätze am Montag?')
    await submit.click()
    await expect(summary(page)).toContainText('Bitte prüfen Sie 1 Feld.')
    await expect(page.getByLabel('E-Mail', { exact: true })).toHaveAttribute('aria-invalid', 'true')
  })

  test('a complete message shows the thank-you message', async ({ page }) => {
    await page.getByLabel('Name', { exact: true }).fill('Erika Mustermann')
    await page.getByLabel('E-Mail', { exact: true }).fill('erika@example.test')
    await page.getByLabel('Nachricht', { exact: true }).fill('Gibt es noch Plätze am Montag?')
    await page.getByRole('button', { name: 'Nachricht senden' }).click()

    const success = page.getByRole('status').filter({ hasText: 'Vielen Dank für Ihre Nachricht!' })
    await expect(success).toBeFocused()
  })
})

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false })

  for (const { path, submit } of [
    { path: '/anmeldeformular/', submit: 'Anmeldung senden' },
    { path: '/kontakt/', submit: 'Nachricht senden' },
  ]) {
    test(`${path} explains that the form needs JavaScript`, async ({ page }) => {
      await page.goto(path)
      await expect(page.getByRole('button', { name: submit })).toBeDisabled()
      await expect(page.getByText(/JavaScript/)).toBeVisible()
    })
  }
})
