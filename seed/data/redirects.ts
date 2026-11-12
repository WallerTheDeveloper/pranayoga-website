/** Old course URLs of the current site that have no direct successor. Course slugs are resolved at seed time. */

export interface SeedRedirect {
  from: string
  toCourseSlug: string
}

export const seedRedirects: SeedRedirect[] = [
  { from: '/kurse/yin-yoga/', toCourseSlug: 'tibetische-klangschalen' },
  { from: '/kurse/kinder-yoga/', toCourseSlug: 'yoga-fuer-jugendliche' },
]
