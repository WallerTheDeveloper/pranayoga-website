/** The public pages the specs walk through, with the file name used for their screenshots. */

export interface SitePage {
  path: string
  name: string
  /** The page's h1, as text or pattern (some headings break with a soft hyphen). */
  heading: string | RegExp
}

export const COURSE_PAGES: readonly SitePage[] = [
  { path: '/', name: 'home', heading: /Ein gesunder Geist/ },
  { path: '/kurse/', name: 'kurse', heading: /Yoga-Kurse in/ },
  { path: '/kurse/hatha-yoga/', name: 'kurs-hatha-yoga', heading: /Hatha Yoga/ },
]

/** Added in phase 3. */
export const INFO_PAGES: readonly SitePage[] = [
  { path: '/ueber-uns/', name: 'ueber-uns', heading: /Liudmyla Schiemann/ },
  { path: '/yogaausbildungen/', name: 'yogaausbildungen', heading: /200 Stunden/ },
  { path: '/mitgliedschaft-preise/', name: 'mitgliedschaft-preise', heading: /Mitgliedschaft/ },
  { path: '/anmeldeformular/', name: 'anmeldeformular', heading: 'Anmeldeformular' },
  { path: '/kontakt/', name: 'kontakt', heading: 'Kontakt' },
  { path: '/impressum/', name: 'impressum', heading: 'Impressum' },
  { path: '/datenschutz/', name: 'datenschutz', heading: /Datenschutz/ },
]

export const ALL_PAGES: readonly SitePage[] = [...COURSE_PAGES, ...INFO_PAGES]

/** Admin text the studio still has to confirm is kept in brackets and must never show. */
export const PLACEHOLDER = /\[[^\]\n]+\]/
