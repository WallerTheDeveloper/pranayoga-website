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
