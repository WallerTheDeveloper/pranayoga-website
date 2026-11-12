import { describe, expect, it } from 'vitest'

import { formatPrice, formatTimeRange, mailtoHref, telHref, WEEKDAY_LABELS } from '@/lib/format'
import { fillPlaceholders, hasOpenPlaceholder, TRIAL_PRICE_TOKEN } from '@/lib/placeholders'

const NBSP = ' '

describe('formatPrice', () => {
  it('formats whole euros without decimals', () => {
    expect(formatPrice(15)).toBe(`15${NBSP}€`)
    expect(formatPrice(1290)).toBe(`1.290${NBSP}€`)
    expect(formatPrice(0)).toBe(`0${NBSP}€`)
  })

  it('keeps cents when present', () => {
    expect(formatPrice(79.9)).toBe(`79,90${NBSP}€`)
    expect(formatPrice(12.5)).toBe(`12,50${NBSP}€`)
  })

  it('returns null for missing or invalid amounts', () => {
    expect(formatPrice(null)).toBeNull()
    expect(formatPrice(undefined)).toBeNull()
    expect(formatPrice(-1)).toBeNull()
    expect(formatPrice(Number.NaN)).toBeNull()
  })
})

describe('formatTimeRange', () => {
  it('joins start and end with an en dash', () => {
    expect(formatTimeRange('18:00', '19:30')).toBe('18:00–19:30 Uhr')
  })

  it('shows only the start when there is no end', () => {
    expect(formatTimeRange('09:15', null)).toBe('09:15 Uhr')
  })
})

describe('weekday labels', () => {
  it('has German labels Monday to Sunday', () => {
    expect(WEEKDAY_LABELS.monday).toBe('Montag')
    expect(WEEKDAY_LABELS.sunday).toBe('Sonntag')
    expect(Object.keys(WEEKDAY_LABELS)).toHaveLength(7)
  })
})

describe('contact hrefs', () => {
  it('builds tel: and mailto: links', () => {
    expect(telHref('+491755830372')).toBe('tel:+491755830372')
    expect(mailtoHref('info@pranayogastudio.de')).toBe('mailto:info@pranayogastudio.de')
  })
})

describe('placeholders', () => {
  it('detects bracketed placeholders the client has not filled in', () => {
    expect(hasOpenPlaceholder('Mindestlaufzeit [Monate]')).toBe(true)
    expect(hasOpenPlaceholder('Mindestlaufzeit 6 Monate')).toBe(false)
    expect(hasOpenPlaceholder('')).toBe(false)
  })

  it('fills the trial price token', () => {
    const text = `Eine Probestunde kostet ${TRIAL_PRICE_TOKEN}.`
    expect(fillPlaceholders(text, { trialPrice: `15${NBSP}€` })).toBe(
      `Eine Probestunde kostet 15${NBSP}€.`,
    )
  })

  it('returns null when a placeholder stays open, so the line can be hidden', () => {
    expect(fillPlaceholders(`kostet ${TRIAL_PRICE_TOKEN}.`, { trialPrice: null })).toBeNull()
    expect(fillPlaceholders('Gültig [Zeitraum]', { trialPrice: '15 €' })).toBeNull()
    expect(fillPlaceholders('Jeder Kurs nach Wunsch', { trialPrice: null })).toBe(
      'Jeder Kurs nach Wunsch',
    )
  })
})
