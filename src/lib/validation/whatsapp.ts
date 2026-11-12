/** Group invites and personal chats. The bare prefixes are the design's placeholders. */
export const WHATSAPP_URL_PREFIXES = ['https://chat.whatsapp.com/', 'https://wa.me/'] as const

export function isValidWhatsAppUrl(value: string): boolean {
  if (!WHATSAPP_URL_PREFIXES.some((prefix) => value.startsWith(prefix))) return false
  try {
    const url = new URL(value)
    return url.protocol === 'https:' && (url.host === 'chat.whatsapp.com' || url.host === 'wa.me')
  } catch {
    return false
  }
}
