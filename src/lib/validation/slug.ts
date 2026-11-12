const GERMAN_LETTERS: Readonly<Record<string, string>> = {
  ä: 'ae',
  ö: 'oe',
  ü: 'ue',
  ß: 'ss',
}

/** German title → URL slug: "Yoga für Jugendliche" → "yoga-fuer-jugendliche". */
export function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[äöüß]/g, (letter) => GERMAN_LETTERS[letter] ?? letter)
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/**
 * A document has a URL once it has a slug, or a title the slug can still be made from (the slug
 * hook fills it in on save). False when neither yields one, e.g. a title of only punctuation.
 */
export function canResolveSlug(slug: unknown, title: unknown): boolean {
  if (typeof slug === 'string' && slugify(slug) !== '') return true
  return typeof title === 'string' && slugify(title) !== ''
}
