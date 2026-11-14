import { Eyebrow } from '@/components/ui/Eyebrow'

import styles from './PranaBand.module.css'

interface PranaBandProps {
  word: string
  eyebrow: string
  text: string
}

/** Moss band with "Prana" inside the breathing ring (8 s cycle; still under reduced motion). */
export function PranaBand({ word, eyebrow, text }: PranaBandProps) {
  return (
    <section className={styles.band}>
      <div className={styles.inner}>
        <div className={styles.wordWrap}>
          <div className={`breath ${styles.ring}`} aria-hidden="true" />
          <p className={`serif ${styles.word}`} lang="sa">
            {word}
          </p>
        </div>
        <div className={`rv ${styles.text}`}>
          <Eyebrow onDark>{eyebrow}</Eyebrow>
          <p className={`serif ${styles.statement}`}>{text}</p>
        </div>
      </div>
    </section>
  )
}
