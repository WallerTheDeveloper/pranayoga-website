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

/** The stored source a same-site target would be looked up as; null for other sites. */
export function sameSiteRedirectPath(target: string): string | null {
  const trimmed = target.trim()
  return trimmed.startsWith('/') ? normalizeRedirectSource(trimmed) : null
}

/** Longer chains than this are not followed; real redirect lists have one hop. */
const MAX_REDIRECT_HOPS = 20

/**
 * True when `from → target`, followed through the other stored redirects (source → target),
 * leads back to `from`: the browser would bounce between the addresses forever.
 */
export function redirectLoops(
  from: string,
  target: string,
  others: ReadonlyMap<string, string>,
): boolean {
  const start = normalizeRedirectSource(from)
  if (!start) return false
  const seen = new Set<string>()
  let next = sameSiteRedirectPath(target)
  while (next !== null && !seen.has(next) && seen.size < MAX_REDIRECT_HOPS) {
    if (next === start) return true
    seen.add(next)
    const stored = others.get(next)
    next = stored === undefined ? null : sameSiteRedirectPath(stored)
  }
  return false
}
