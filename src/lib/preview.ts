import { RESERVED_PATH_PREFIXES, absoluteUrl, isValidSlug, routes } from './routes'

/**
 * Draft preview links. Payload's Live Preview iframe opens `PREVIEW_ROUTE`, which checks the secret
 * and the admin session, turns on Draft Mode and redirects to the page. Keep this file free of
 * Next/Payload imports so the Payload config and unit tests can load it.
 */

export const PREVIEW_ROUTE = '/next/preview/'
export const EXIT_PREVIEW_ROUTE = '/next/exit-preview/'

/**
 * Only same-site page paths may be previewed: one leading slash, no scheme or host, no backslash,
 * no dot segments, nothing under Payload's or Next's own prefixes.
 */
export function isSafePreviewPath(path: unknown): path is string {
  if (typeof path !== 'string' || path.length === 0 || path.length > 200) return false
  if (!path.startsWith('/') || path.startsWith('//') || path.includes('\\')) return false
  if (/[\u0000-\u001f\u007f]/.test(path)) return false
  if (path.includes('://')) return false
  // Dot segments (also percent-encoded) would let the browser climb out of the page path.
  if (/(^|\/)(\.|%2e){1,2}(\/|$)/i.test(path)) return false
  return !RESERVED_PATH_PREFIXES.some((prefix) => path === prefix || path.startsWith(`${prefix}/`))
}

export type PreviewSource =
  | { kind: 'collection'; slug: string; data: Readonly<Record<string, unknown>> }
  | { kind: 'global'; slug: string }

/** The public page that shows a document, or null when it has no page of its own. */
export function previewPathFor(source: PreviewSource): string | null {
  if (source.kind === 'global') {
    return source.slug === 'business-settings' ? routes.home() : null
  }
  switch (source.slug) {
    case 'courses': {
      const slug = source.data.slug
      return typeof slug === 'string' && isValidSlug(slug) ? routes.course(slug) : null
    }
    case 'price-groups':
      return routes.pricing()
    case 'reviews':
      return routes.home()
    default:
      return null
  }
}

interface PreviewUrlArgs {
  origin: string
  secret: string
  path: string
}

export function previewUrl({ origin, secret, path }: PreviewUrlArgs): string {
  const query = new URLSearchParams({ path, secret })
  return `${absoluteUrl(PREVIEW_ROUTE, origin)}?${query.toString()}`
}
