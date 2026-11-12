import { expect, test, type Page } from '@playwright/test'

import { settle } from './settle'

/** No third-party requests and no visitor cookies (fonts, images and scripts are self-hosted). */

function collectForeignRequests(page: Page, origin: string): string[] {
  const foreign: string[] = []
  page.on('request', (request) => {
    const url = new URL(request.url())
    if (url.protocol.startsWith('http') && url.origin !== origin) foreign.push(request.url())
  })
  return foreign
}

for (const pagePath of ['/', '/kurse/', '/kurse/hatha-yoga/']) {
  test(`${pagePath} only talks to its own origin and sets no cookies`, async ({
    page,
    context,
    baseURL,
  }) => {
    const foreign = collectForeignRequests(page, new URL(baseURL ?? '').origin)
    await page.goto(pagePath)
    await settle(page)

    expect(foreign).toEqual([])
    expect(await context.cookies()).toEqual([])
  })
}

test('the phone layout only talks to its own origin @mobile', async ({
  page,
  context,
  baseURL,
}) => {
  const foreign = collectForeignRequests(page, new URL(baseURL ?? '').origin)
  await page.goto('/')
  await settle(page)
  await page.getByRole('button', { name: 'Menü', exact: true }).click()
  await expect(page.getByRole('dialog', { name: 'Menü', exact: true })).toBeVisible()
  await settle(page)

  expect(foreign).toEqual([])
  expect(await context.cookies()).toEqual([])
})
