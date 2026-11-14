const SAFE_SCHEMES = new Set(['http:', 'https:', 'mailto:', 'tel:'])

/** A backslash or a control character: browsers turn "/\host" and "/<tab>/host" into "//host". */
const UNSAFE_PATH_CHARS = /[\\\u0000-\u001f\u007f]/

/**
 * A link target from rich text, or null when it could run code or is malformed. Allows web,
 * mail and phone links plus same-site paths and anchors; refuses `javascript:`, `data:` and
 * the rest, however they are spelled, and paths that a browser would read as another site.
 */
export function safeHref(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  if (!trimmed) return null
  if (/^[/#?]/.test(trimmed)) {
    return trimmed.startsWith('//') || UNSAFE_PATH_CHARS.test(trimmed) ? null : trimmed
  }
  try {
    const url = new URL(trimmed)
    return SAFE_SCHEMES.has(url.protocol) ? trimmed : null
  } catch {
    return null
  }
}
