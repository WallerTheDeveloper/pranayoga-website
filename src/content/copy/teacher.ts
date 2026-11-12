import type { CopyMediaKey } from './mediaRefs'

export interface Seal {
  image: CopyMediaKey
  title: string
  issuer: string
}

/** The teacher card on the home page (and later the course pages). */
export const teacherCopy = {
  eyebrow: 'Ihre Lehrerin',
  name: 'Liudmyla Schiemann',
  experience: 'Über 20 Jahre Praxiserfahrung.',
  bio: 'Hatha-, Yin- und Prenatal-Yoga-Lehrerin. Ausgebildet im Arhanta Yoga Ashram in den Niederlanden und bei der Ukrainian Yoga Alliance, mit Retreats in Malaysia und Indonesien.',
  quote: 'Yoga ist für mich mehr als körperliche Bewegung – es ist meine Lebensphilosophie.',
  portrait: 'teacherPortrait' as CopyMediaKey,
  sealsLabel: 'Zertifizierungen bei der Yoga Alliance',
  seals: [
    { image: 'sealEryt200', title: 'E-RYT 200', issuer: 'Yoga Alliance' },
    { image: 'sealEryt500', title: 'E-RYT 500', issuer: 'Yoga Alliance' },
    { image: 'sealYacep', title: 'YACEP', issuer: 'Yoga Alliance' },
  ] as const satisfies readonly Seal[],
  moreLink: 'Mehr über Liudmyla',
} as const
