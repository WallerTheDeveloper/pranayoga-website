import { RESERVED_PATH_PREFIXES } from '../routes'

function parseUrl(value: string): URL | null {
  try {
    return new URL(value)
  } catch {
    return null
  }
}

/** A bare origin such as `https://pranayogastudio.de`: http(s), no path, query or fragment. */
export function isSiteOrigin(value: string): boolean {
  const url = parseUrl(value)
  if (!url || (url.protocol !== 'https:' && url.protocol !== 'http:')) return false
  if (url.username || url.password || url.search || url.hash) return false
  return url.pathname === '/' && !value.trim().endsWith('//')
}

const MAPS_EMBED_HOSTS = ['www.google.com', 'maps.google.com'] as const

/** The `src` of Google Maps' "Embed a map" iframe. */
export function isGoogleMapsEmbedUrl(value: string): boolean {
  const url = parseUrl(value)
  if (!url || url.protocol !== 'https:') return false
  return (
    (MAPS_EMBED_HOSTS as readonly string[]).includes(url.host) &&
    url.pathname.startsWith('/maps/embed')
  )
}

/** German postal code: five digits. */
export function isValidPostalCode(value: string): boolean {
  return /^\d{5}$/.test(value)
}

/**
 * Normalises an old URL entered in Redirects: keeps only the path, adds the leading and trailing
 * slash (the site uses `trailingSlash: true`) and lowercases it. Returns null for anything that
 * isn't a same-site path.
 */
export function normalizeRedirectSource(value: string): string | null {
  let path = value.trim()
  if (path.length === 0) return null
  const absolute = parseUrl(path)
  if (absolute) {
    if (absolute.protocol !== 'https:' && absolute.protocol !== 'http:') return null
    path = absolute.pathname
  }
  if (!path.startsWith('/')) path = `/${path}`
  if (path.startsWith('//') || path.includes('\\') || /[\s?#]/.test(path)) return null
  if (!path.endsWith('/') && !/\.[a-z0-9]{2,5}$/i.test(path)) path = `${path}/`
  path = path.toLowerCase()
  const reserved = RESERVED_PATH_PREFIXES.some(
    (prefix) => path === `${prefix}/` || path.startsWith(`${prefix}/`),
  )
  return reserved || path === '/' ? null : path
}

/**
 * A redirect target: a same-site path, or an https URL. Control characters and inner whitespace
 * are refused: browsers drop tabs and newlines, so "/<tab>/evil.example" would become a
 * protocol-relative "//evil.example".
 */
export function isSafeRedirectTarget(value: string): boolean {
  const target = value.trim()
  if (/[\u0000- \u007f]/.test(target)) return false
  if (target.startsWith('/')) return !target.startsWith('//') && !target.includes('\\')
  const url = parseUrl(target)
  return url?.protocol === 'https:'
}
