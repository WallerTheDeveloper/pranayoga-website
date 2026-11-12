/**
 * Single source of truth for every public route.
 *
 * Route folders are English (`app/(site)/courses/[slug]`); public URLs are German (`/kurse/:slug/`).
 * next.config reads `buildRewrites()` and `buildRedirects()`; links, breadcrumbs, the sitemap and
 * Payload Live Preview read the `routes` href builders. Keep this file free of Next/Payload imports,
 * because next.config loads it before the build.
 */

export type RouteKey =
  | 'home'
  | 'courses'
  | 'course'
  | 'pricing'
  | 'signup'
  | 'about'
  | 'teacherTraining'
  | 'contact'
  | 'legalNotice'
  | 'privacyPolicy'

export interface RouteDefinition {
  /** Path of the English route folder, with trailing slash and `:param` placeholders. */
  readonly internal: string
  /** Public German path, with trailing slash and `:param` placeholders. */
  readonly public: string
}

export const routeTable: Readonly<Record<RouteKey, RouteDefinition>> = {
  home: { internal: '/', public: '/' },
  courses: { internal: '/courses/', public: '/kurse/' },
  course: { internal: '/courses/:slug/', public: '/kurse/:slug/' },
  pricing: { internal: '/pricing/', public: '/mitgliedschaft-preise/' },
  signup: { internal: '/signup/', public: '/anmeldeformular/' },
  about: { internal: '/about/', public: '/ueber-uns/' },
  teacherTraining: { internal: '/teacher-training/', public: '/yogaausbildungen/' },
  contact: { internal: '/contact/', public: '/kontakt/' },
  legalNotice: { internal: '/legal-notice/', public: '/impressum/' },
  privacyPolicy: { internal: '/privacy-policy/', public: '/datenschutz/' },
}

/** Course slugs are lowercase ASCII words joined by single hyphens (`hatha-yoga`). */
export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export function isValidSlug(value: string): boolean {
  return SLUG_PATTERN.test(value)
}

function assertSlug(slug: string): string {
  if (!isValidSlug(slug)) {
    throw new Error(`Invalid course slug: "${slug}"`)
  }
  return slug
}

/** Typed href builders. Every link on the site goes through these. */
export const routes = {
  home: (): string => routeTable.home.public,
  courses: (): string => routeTable.courses.public,
  course: (slug: string): string => routeTable.course.public.replace(':slug', assertSlug(slug)),
  pricing: (): string => routeTable.pricing.public,
  signup: (): string => routeTable.signup.public,
  about: (): string => routeTable.about.public,
  teacherTraining: (): string => routeTable.teacherTraining.public,
  contact: (): string => routeTable.contact.public,
  legalNotice: (): string => routeTable.legalNotice.public,
  privacyPolicy: (): string => routeTable.privacyPolicy.public,
} as const satisfies Record<RouteKey, (...args: never[]) => string>

export interface RewriteRule {
  readonly source: string
  readonly destination: string
}

export interface RedirectRule {
  readonly source: string
  readonly destination: string
  readonly statusCode: 301
}

function routesWithDistinctPaths(): RouteDefinition[] {
  return Object.values(routeTable).filter((route) => route.internal !== route.public)
}

/** German URL → English route folder. Served internally, the browser keeps the German URL. */
export function buildRewrites(): RewriteRule[] {
  return routesWithDistinctPaths().map((route) => ({
    source: route.public,
    destination: route.internal,
  }))
}

/**
 * English URL → German URL (301), so search engines never see a page twice. Next matches redirects
 * against the incoming URL only, never against a rewritten one, so this cannot loop with the rewrites.
 */
export function buildRedirects(): RedirectRule[] {
  return routesWithDistinctPaths().map((route) => ({
    source: route.internal,
    destination: route.public,
    statusCode: 301,
  }))
}

function ensureTrailingSlash(path: string): string {
  return path.endsWith('/') ? path : `${path}/`
}

function patternToRegExp(pattern: string): RegExp {
  const escaped = pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(':slug', '([a-z0-9-]+)')
  return new RegExp(`^${escaped}$`)
}

/**
 * The public German path for any path of ours. A rewritten page is prerendered at its internal
 * path (`/courses/x/`) but the browser shows `/kurse/x/`; normalising both keeps server and client
 * renders identical, e.g. for `aria-current`.
 */
export function toPublicPath(pathname: string): string {
  const path = ensureTrailingSlash(pathname.split(/[?#]/)[0] ?? '/')
  for (const route of Object.values(routeTable)) {
    const match = patternToRegExp(route.internal).exec(path)
    if (match) return match[1] ? route.public.replace(':slug', match[1]) : route.public
  }
  return path
}

/** True for the exact page. */
export function isCurrentPage(pathname: string | null, href: string): boolean {
  return pathname !== null && toPublicPath(pathname) === toPublicPath(href)
}

/** True for the page and everything below it (the "Kurse" link on a course page). */
export function isCurrentSection(pathname: string | null, href: string): boolean {
  if (pathname === null || href === routeTable.home.public) return false
  return toPublicPath(pathname).startsWith(toPublicPath(href))
}

/** Paths that belong to Payload or Next internals and are never rewritten or redirected. */
export const RESERVED_PATH_PREFIXES = ['/admin', '/api', '/next', '/_next'] as const

/** Absolute URL for a public path, for metadata, sitemap and Live Preview. */
export function absoluteUrl(path: string, origin: string): string {
  const base = origin.endsWith('/') ? origin.slice(0, -1) : origin
  const suffix = path.startsWith('/') ? path : `/${path}`
  return `${base}${suffix}`
}
