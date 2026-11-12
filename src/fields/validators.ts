import type {
  NumberFieldValidation,
  TextFieldValidation,
  TextareaFieldValidation,
  UploadFieldValidation,
} from 'payload'
import { number, text, textarea, upload } from 'payload/shared'

import { isValidIban } from '@/lib/validation/iban'
import {
  IMAGE_TIER_MIN_SHORT_SIDE,
  meetsImageTier,
  type ImageTier,
} from '@/lib/validation/imageTier'
import { isValidPhoneE164 } from '@/lib/validation/phone'
import { isAllowedSocialUrl, type SocialPlatform } from '@/lib/validation/social'
import { isValidTime } from '@/lib/validation/time'
import {
  isGoogleMapsEmbedUrl,
  isSafeRedirectTarget,
  isSiteOrigin,
  isValidPostalCode,
  normalizeRedirectSource,
} from '@/lib/validation/url'
import { isValidWhatsAppUrl } from '@/lib/validation/whatsapp'

/**
 * Payload validators for the guardrails in docs/PLAN.md. Each runs Payload's own validation first
 * (required, maxLength …) and then its own rule. Messages are German, since the client edits in
 * German; the admin UI labels stay bilingual.
 */

function isEmpty(value: unknown): boolean {
  return value === null || value === undefined || value === ''
}

export const validateWhatsAppUrl: TextFieldValidation = async (value, options) => {
  const base = await text(value, options)
  if (base !== true || isEmpty(value)) return base
  return isValidWhatsAppUrl(String(value))
    ? true
    : 'Der Link muss mit https://chat.whatsapp.com/ oder https://wa.me/ beginnen.'
}

export function validateSocialUrl(platform: SocialPlatform): TextFieldValidation {
  return async (value, options) => {
    const base = await text(value, options)
    if (base !== true || isEmpty(value)) return base
    return isAllowedSocialUrl(String(value), platform)
      ? true
      : `Bitte die vollständige https-Adresse des ${platform === 'instagram' ? 'Instagram' : 'Facebook'}-Profils eintragen.`
  }
}

export const validateIban: TextFieldValidation = async (value, options) => {
  const base = await text(value, options)
  if (base !== true || isEmpty(value)) return base
  return isValidIban(String(value))
    ? true
    : 'Diese IBAN ist nicht gültig. Bitte prüfen Sie die Ziffern.'
}

export const validatePhoneE164: TextFieldValidation = async (value, options) => {
  const base = await text(value, options)
  if (base !== true || isEmpty(value)) return base
  return isValidPhoneE164(String(value))
    ? true
    : 'Bitte im internationalen Format ohne Leerzeichen eintragen, z. B. +491755830372.'
}

export const validateTime: TextFieldValidation = async (value, options) => {
  const base = await text(value, options)
  if (base !== true || isEmpty(value)) return base
  return isValidTime(String(value)) ? true : 'Bitte als Uhrzeit HH:MM eintragen, z. B. 18:30.'
}

export const validateHttpsUrl: TextFieldValidation = async (value, options) => {
  const base = await text(value, options)
  if (base !== true || isEmpty(value)) return base
  try {
    return new URL(String(value)).protocol === 'https:'
      ? true
      : 'Bitte eine https-Adresse eintragen.'
  } catch {
    return 'Bitte eine vollständige Adresse eintragen, z. B. https://…'
  }
}

export const validateSiteOrigin: TextFieldValidation = async (value, options) => {
  const base = await text(value, options)
  if (base !== true || isEmpty(value)) return base
  return isSiteOrigin(String(value))
    ? true
    : 'Bitte nur die Adresse der Website ohne Pfad eintragen, z. B. https://pranayogastudio.de'
}

export const validateGoogleMapsEmbedUrl: TextFieldValidation = async (value, options) => {
  const base = await text(value, options)
  if (base !== true || isEmpty(value)) return base
  return isGoogleMapsEmbedUrl(String(value))
    ? true
    : 'Bitte die Adresse aus „Karte einbetten“ in Google Maps eintragen (beginnt mit https://www.google.com/maps/embed).'
}

export const validatePostalCode: TextFieldValidation = async (value, options) => {
  const base = await text(value, options)
  if (base !== true || isEmpty(value)) return base
  return isValidPostalCode(String(value)) ? true : 'Bitte eine fünfstellige Postleitzahl eintragen.'
}

export const validateRedirectSource: TextFieldValidation = async (value, options) => {
  const base = await text(value, options)
  if (base !== true || isEmpty(value)) return base
  return normalizeRedirectSource(String(value)) === null
    ? 'Bitte einen Pfad dieser Website eintragen, z. B. /kurse/yin-yoga/ (nicht /admin, /api oder die Startseite).'
    : true
}

export const validateRedirectTarget: TextFieldValidation = async (value, options) => {
  const base = await text(value, options)
  if (base !== true || isEmpty(value)) return base
  return isSafeRedirectTarget(String(value))
    ? true
    : 'Bitte einen Pfad wie /kurse/ oder eine https-Adresse eintragen.'
}

export const validatePrice: NumberFieldValidation = async (value, options) => {
  const base = await number(value, options)
  if (base !== true || value === null || value === undefined) return base
  const values = Array.isArray(value) ? value : [value]
  return values.every((item) => Number.isFinite(item) && item >= 0)
    ? true
    : 'Der Preis muss eine Zahl ab 0 sein.'
}

/** Plain-text textarea with Payload's checks (required, maxLength). Re-exported for symmetry. */
export const validateTextarea: TextareaFieldValidation = (value, options) =>
  textarea(value, options)

/** Upload field: the referenced image must be large enough for its tier. */
export function validateImageTier(tier: ImageTier): UploadFieldValidation {
  return async (value, options) => {
    const base = await upload(value, options)
    if (base !== true || isEmpty(value)) return base

    const id = typeof value === 'object' && value !== null && 'id' in value ? value.id : value
    if (typeof id !== 'number' && typeof id !== 'string') return base

    const media = await options.req.payload.findByID({
      collection: 'media',
      id,
      depth: 0,
      req: options.req,
      disableErrors: true,
      overrideAccess: true,
    })
    if (!media) return 'Das ausgewählte Bild wurde nicht gefunden.'
    return meetsImageTier(media, tier)
      ? true
      : `Das Bild ist zu klein für diese Stelle: die kürzere Seite braucht mindestens ${IMAGE_TIER_MIN_SHORT_SIDE[tier]} Pixel.`
  }
}
