/**
 * Admin label in both admin languages. Every custom label is `{ de, en }`.
 * A type alias, not an interface: Payload expects `Record<string, string>`, and only aliases get
 * the implicit index signature.
 */
export type Label = {
  de: string
  en: string
}

export function label(de: string, en: string): Label {
  return { de, en }
}

/** Admin navigation groups (docs/PLAN.md "Access & permissions"). */
export const ADMIN_GROUPS = {
  content: label('Inhalte', 'Content'),
  prices: label('Preise', 'Prices'),
  settings: label('Einstellungen', 'Settings'),
  technical: label('Technik', 'Technical'),
} as const
