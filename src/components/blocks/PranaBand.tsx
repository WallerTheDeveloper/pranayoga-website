import { Eyebrow } from '@/components/ui/Eyebrow'

import styles from './PranaBand.module.css'

interface PranaBandProps {
  word: string
  eyebrow: string
  text: string
}

/** The breathing ring animates in phase 3 (motion pass); here it stands still. */
export function PranaBand({ word, eyebrow, text }: PranaBandProps) {
  return (
    <section className={styles.band}>
      <div className={styles.inner}>
        <div className={styles.wordWrap}>
          <div className={styles.ring} aria-hidden="true" />
          <p className={`serif ${styles.word}`} lang="sa">
            {word}
          </p>
        </div>
        <div className={styles.text}>
          <Eyebrow onDark>{eyebrow}</Eyebrow>
          <p className={`serif ${styles.statement}`}>{text}</p>
        </div>
      </div>
    </section>
  )
}
