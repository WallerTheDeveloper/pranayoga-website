import { mailtoHref, telHref } from '@/lib/format'
import { formatIban, isValidIban } from '@/lib/validation/iban'
import { isValidPhoneE164 } from '@/lib/validation/phone'
import { isAllowedSocialUrl } from '@/lib/validation/social'
import { isGoogleMapsEmbedUrl, isSiteOrigin } from '@/lib/validation/url'
import { isValidWhatsAppUrl } from '@/lib/validation/whatsapp'
import type { BusinessSetting, Review, TechnicalSetting } from '@/payload-types'

import type { BusinessSettingsView, ReviewView, TechnicalSettingsView } from '../types'
import { toSeo } from './courses'
import { cleanText } from './values'

/**
 * Settings are re-validated on the way out: a value that would produce a broken or unsafe link
 * (an unpublished draft, a hand-edited row) is dropped, and the component hides it.
 */

function validOrNull(value: unknown, isValid: (text: string) => boolean): string | null {
  const text = cleanText(value)
  return text && isValid(text) ? text : null
}

function isHttpsUrl(value: string): boolean {
  try {
    return new URL(value).protocol === 'https:'
  } catch {
    return false
  }
}

function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

export function toBusinessSettings(doc: Partial<BusinessSetting> | null): BusinessSettingsView {
  const contact = doc?.contact
  const phoneE164 = validOrNull(contact?.phoneE164, isValidPhoneE164)
  const phoneDisplay = cleanText(contact?.phoneDisplay)
  const email = validOrNull(contact?.email, isEmail)
  const postalCode = cleanText(contact?.postalCode)
  const city = cleanText(contact?.city)
  const iban = validOrNull(doc?.bank?.iban, isValidIban)
  return {
    contact: {
      phoneDisplay: phoneE164 ? phoneDisplay : null,
      phoneHref: phoneE164 && phoneDisplay ? telHref(phoneE164) : null,
      email,
      emailHref: email ? mailtoHref(email) : null,
      street: cleanText(contact?.street),
      postalCode,
      city,
      cityLine: postalCode && city ? `${postalCode} ${city}` : null,
    },
    whatsApp: {
      groupUrl: validOrNull(doc?.whatsApp?.groupUrl, isValidWhatsAppUrl),
      personalChatUrl: validOrNull(doc?.whatsApp?.personalChatUrl, isValidWhatsAppUrl),
    },
    social: {
      instagramUrl: validOrNull(doc?.social?.instagramUrl, (url) =>
        isAllowedSocialUrl(url, 'instagram'),
      ),
      facebookUrl: validOrNull(doc?.social?.facebookUrl, (url) =>
        isAllowedSocialUrl(url, 'facebook'),
      ),
      googleReviewsUrl: validOrNull(doc?.social?.googleReviewsUrl, isHttpsUrl),
    },
    bank: {
      accountHolder: cleanText(doc?.bank?.accountHolder),
      bankName: cleanText(doc?.bank?.bankName),
      iban: iban ? formatIban(iban) : null,
      paymentReference: cleanText(doc?.bank?.paymentReference),
    },
  }
}

/**
 * Missing technical settings fail safe: `noindex` stays on and the site URL falls back to the
 * server URL from env.
 */
export function toTechnicalSettings(
  doc: Partial<TechnicalSetting> | null,
  fallbackSiteUrl: string,
): TechnicalSettingsView {
  const siteUrl = validOrNull(doc?.siteUrl, isSiteOrigin)
  return {
    siteUrl: (siteUrl ?? fallbackSiteUrl).replace(/\/+$/, ''),
    noindex: doc?.noindex !== false,
    defaultSeo: toSeo(doc?.defaultSeo),
    featureFlags: {
      introLoader: doc?.featureFlags?.introLoader === true,
      cookieBanner: doc?.featureFlags?.cookieBanner === true,
    },
    googleMapsEmbedUrl: validOrNull(doc?.googleMapsEmbedUrl, isGoogleMapsEmbedUrl),
  }
}

export function toReview(doc: Review): ReviewView | null {
  const author = cleanText(doc.author)
  const text = cleanText(doc.text)
  if (!author || !text) return null
  return {
    id: String(doc.id),
    author,
    text,
    source: cleanText(doc.source) ?? 'Google-Bewertung',
  }
}
