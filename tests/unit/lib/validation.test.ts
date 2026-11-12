import { describe, expect, it } from 'vitest'

import { formatIban, isValidIban, normalizeIban } from '@/lib/validation/iban'
import { isValidPhoneE164 } from '@/lib/validation/phone'
import { isValidTime, compareTimes } from '@/lib/validation/time'
import { isValidWhatsAppUrl, WHATSAPP_URL_PREFIXES } from '@/lib/validation/whatsapp'
import { isAllowedSocialUrl } from '@/lib/validation/social'
import { meetsImageTier, IMAGE_TIER_MIN_SHORT_SIDE } from '@/lib/validation/imageTier'
import { slugify } from '@/lib/validation/slug'

describe('IBAN', () => {
  it('accepts a valid German IBAN with or without spaces', () => {
    expect(isValidIban('DE89 3704 0044 0532 0130 00')).toBe(true)
    expect(isValidIban('DE89370400440532013000')).toBe(true)
    expect(isValidIban('de89 3704 0044 0532 0130 00')).toBe(true)
  })

  it('rejects a wrong checksum, a wrong length and junk', () => {
    expect(isValidIban('DE88 3704 0044 0532 0130 00')).toBe(false)
    expect(isValidIban('DE89 3704 0044 0532 0130 0')).toBe(false)
    expect(isValidIban('')).toBe(false)
    expect(isValidIban('NOT AN IBAN')).toBe(false)
    expect(isValidIban('XX89370400440532013000')).toBe(false)
  })

  it('normalizes and formats in groups of four', () => {
    expect(normalizeIban(' de89 3704-0044 0532 0130 00 ')).toBe('DE89370400440532013000')
    expect(formatIban('DE89370400440532013000')).toBe('DE89 3704 0044 0532 0130 00')
  })
})

describe('WhatsApp links', () => {
  it('accepts group invites and wa.me chats', () => {
    expect(isValidWhatsAppUrl('https://chat.whatsapp.com/AbCdEf123')).toBe(true)
    expect(isValidWhatsAppUrl('https://wa.me/491755830372')).toBe(true)
  })

  it('accepts the bare prefixes used as placeholders', () => {
    for (const prefix of WHATSAPP_URL_PREFIXES) {
      expect(isValidWhatsAppUrl(prefix)).toBe(true)
    }
  })

  it('rejects other hosts, http and look-alike domains', () => {
    expect(isValidWhatsAppUrl('http://wa.me/491755830372')).toBe(false)
    expect(isValidWhatsAppUrl('https://wa.me.evil.example/1')).toBe(false)
    expect(isValidWhatsAppUrl('https://example.com/https://wa.me/')).toBe(false)
    expect(isValidWhatsAppUrl('javascript:alert(1)')).toBe(false)
    expect(isValidWhatsAppUrl('')).toBe(false)
  })
})

describe('social profile links', () => {
  it('accepts https profile URLs on the platform host', () => {
    expect(isAllowedSocialUrl('https://www.instagram.com/pranayoga', 'instagram')).toBe(true)
    expect(isAllowedSocialUrl('https://instagram.com/pranayoga', 'instagram')).toBe(true)
    expect(isAllowedSocialUrl('https://www.facebook.com/pranayoga', 'facebook')).toBe(true)
  })

  it('rejects other hosts, placeholders and non-https', () => {
    expect(isAllowedSocialUrl('#', 'instagram')).toBe(false)
    expect(isAllowedSocialUrl('https://facebook.com/x', 'instagram')).toBe(false)
    expect(isAllowedSocialUrl('http://www.instagram.com/x', 'instagram')).toBe(false)
    expect(isAllowedSocialUrl('https://instagram.com.evil.example/x', 'instagram')).toBe(false)
  })
})

describe('phone numbers', () => {
  it('accepts E.164 numbers', () => {
    expect(isValidPhoneE164('+491755830372')).toBe(true)
  })

  it('rejects national format and junk', () => {
    expect(isValidPhoneE164('0175 5830372')).toBe(false)
    expect(isValidPhoneE164('+49 175 5830372')).toBe(false)
    expect(isValidPhoneE164('+0')).toBe(false)
  })
})

describe('times', () => {
  it('accepts 24-hour HH:MM', () => {
    expect(isValidTime('09:30')).toBe(true)
    expect(isValidTime('18:00')).toBe(true)
    expect(isValidTime('23:59')).toBe(true)
  })

  it('rejects other shapes', () => {
    expect(isValidTime('9:30')).toBe(false)
    expect(isValidTime('24:00')).toBe(false)
    expect(isValidTime('12:60')).toBe(false)
    expect(isValidTime('')).toBe(false)
  })

  it('compares times', () => {
    expect(compareTimes('09:00', '10:30')).toBeLessThan(0)
    expect(compareTimes('18:00', '18:00')).toBe(0)
    expect(compareTimes('19:15', '18:00')).toBeGreaterThan(0)
  })
})

describe('image tiers', () => {
  it('uses the tier display width as the minimum short side', () => {
    expect(IMAGE_TIER_MIN_SHORT_SIDE).toEqual({ feature: 600, card: 440, small: 330 })
  })

  it('checks the shorter side against the tier', () => {
    expect(meetsImageTier({ width: 1067, height: 1600 }, 'feature')).toBe(true)
    expect(meetsImageTier({ width: 683, height: 1024 }, 'feature')).toBe(true)
    expect(meetsImageTier({ width: 500, height: 500 }, 'feature')).toBe(false)
    expect(meetsImageTier({ width: 500, height: 500 }, 'small')).toBe(true)
    expect(meetsImageTier({ width: 360, height: 360 }, 'small')).toBe(true)
    expect(meetsImageTier({ width: 1024, height: 300 }, 'card')).toBe(false)
  })

  it('fails when dimensions are unknown', () => {
    expect(meetsImageTier({ width: null, height: 800 }, 'card')).toBe(false)
  })
})

describe('slugify', () => {
  it('turns German titles into URL slugs', () => {
    expect(slugify('Hatha Yoga')).toBe('hatha-yoga')
    expect(slugify('Rücken Yoga')).toBe('ruecken-yoga')
    expect(slugify('Yoga für Jugendliche')).toBe('yoga-fuer-jugendliche')
    expect(slugify('Tibetische Klangschalen')).toBe('tibetische-klangschalen')
    expect(slugify('Großes Ölbad – Äußerst!')).toBe('grosses-oelbad-aeusserst')
  })

  it('collapses separators and trims', () => {
    expect(slugify('  Yoga   Sport // Balance  ')).toBe('yoga-sport-balance')
    expect(slugify('---')).toBe('')
  })
})
