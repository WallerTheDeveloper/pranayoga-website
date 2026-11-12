import { describe, expect, it } from 'vitest'

import { localMediaPath, toImage, withVersion } from '@/content/mappers/media'
import { asArray, asBoolean, cleanText, isPresent, rawText, rowId } from '@/content/mappers/values'

import { mediaDoc } from '../../fixtures/docs'

describe('value readers', () => {
  it('cleanText trims and hides empty or placeholder text', () => {
    expect(cleanText('  Hatha  ')).toBe('Hatha')
    expect(cleanText('   ')).toBeNull()
    expect(cleanText('Mindestlaufzeit [Monate]')).toBeNull()
    expect(cleanText(42)).toBeNull()
    expect(cleanText(undefined)).toBeNull()
  })

  it('rawText keeps placeholders for the caller to fill', () => {
    expect(rawText(' kostet [Preis Probestunde] ')).toBe('kostet [Preis Probestunde]')
    expect(rawText('')).toBeNull()
    expect(rawText(null)).toBeNull()
  })

  it('asBoolean is true only for true', () => {
    expect(asBoolean(true)).toBe(true)
    expect(asBoolean('true')).toBe(false)
    expect(asBoolean(null)).toBe(false)
  })

  it('asArray tolerates missing arrays', () => {
    expect(asArray(null)).toEqual([])
    expect(asArray(undefined)).toEqual([])
    expect(asArray([1, 2])).toEqual([1, 2])
  })

  it('rowId prefers the stored id and falls back to the index', () => {
    expect(rowId('abc', 0)).toBe('abc')
    expect(rowId(12, 0)).toBe('12')
    expect(rowId('', 3)).toBe('row-3')
    expect(rowId(null, 2)).toBe('row-2')
  })

  it('isPresent filters null and undefined only', () => {
    expect([0, null, '', undefined, false].filter(isPresent)).toEqual([0, '', false])
  })
})

describe('localMediaPath', () => {
  it('keeps local media paths', () => {
    expect(localMediaPath('/api/media/file/a.jpg')).toBe('/api/media/file/a.jpg')
  })

  it('strips the origin from absolute upload URLs', () => {
    expect(localMediaPath('https://pranayogastudio.de/api/media/file/a.jpg?x=1')).toBe(
      '/api/media/file/a.jpg?x=1',
    )
  })

  it('drops the trailing slash Payload adds in trailing-slash mode', () => {
    expect(localMediaPath('http://localhost:3000/api/media/file/a-660x990.jpg/')).toBe(
      '/api/media/file/a-660x990.jpg',
    )
    expect(localMediaPath('/api/media/file/a.jpg/?x=1')).toBe('/api/media/file/a.jpg?x=1')
    expect(localMediaPath('/api/media/file/a..b.jpg')).toBe('/api/media/file/a..b.jpg')
  })

  it('rejects anything outside the media route', () => {
    expect(localMediaPath('/etc/passwd')).toBeNull()
    expect(localMediaPath('/api/media/file/../../secret')).toBeNull()
    expect(localMediaPath('https://evil.example/x.jpg')).toBeNull()
    expect(localMediaPath('not a url')).toBeNull()
    expect(localMediaPath('/api/media/file/')).toBeNull()
    expect(localMediaPath(null)).toBeNull()
    expect(localMediaPath('')).toBeNull()
  })
})

describe('withVersion', () => {
  it('appends the update timestamp', () => {
    expect(withVersion('/a.jpg', '2026-05-01T10:00:00.000Z')).toBe('/a.jpg?v=1777629600000')
    expect(withVersion('/a.jpg?x=1', '2026-05-01T10:00:00.000Z')).toBe('/a.jpg?x=1&v=1777629600000')
  })

  it('leaves the path alone without a valid date', () => {
    expect(withVersion('/a.jpg', null)).toBe('/a.jpg')
    expect(withVersion('/a.jpg', 'yesterday')).toBe('/a.jpg')
  })
})

describe('toImage', () => {
  it('uses the tier size, alt text and focal point', () => {
    expect(toImage(mediaDoc(), 'card')).toEqual({
      src: '/api/media/file/teacher-660x990.jpg?v=1777629600000',
      alt: 'Yogalehrerin am Fenster',
      width: 660,
      height: 990,
      objectPosition: '40% 30%',
    })
  })

  it('falls back to the original when the tier size is missing', () => {
    const image = toImage(mediaDoc({ focalX: null, focalY: null }), 'small')
    expect(image?.src).toBe('/api/media/file/teacher.jpg?v=1777629600000')
    expect(image?.width).toBe(1200)
    expect(image?.objectPosition).toBe('50% 50%')
  })

  it('returns null for ids, missing files and foreign URLs', () => {
    expect(toImage(7, 'card')).toBeNull()
    expect(toImage(null, 'card')).toBeNull()
    expect(toImage(mediaDoc({ sizes: {}, width: null }), 'card')).toBeNull()
    expect(toImage(mediaDoc({ sizes: {}, url: 'https://cdn.example/x.jpg' }), 'card')).toBeNull()
  })

  it('never exposes a placeholder alt text', () => {
    expect(toImage(mediaDoc({ alt: '[Alt fehlt]' }), 'card')?.alt).toBe('')
  })
})
