import type { ReactNode } from 'react'

import { Breadcrumbs } from '@/components/layout/Breadcrumbs'
import { legalCopy } from '@/content/copy/legal'
import type { LegalPageView } from '@/content/types'

import styles from './LegalPage.module.css'
import { LegalText } from './LegalText'

interface LegalPageProps {
  breadcrumb: string
  heading: string
  page: LegalPageView
  /** Above the text, e.g. the Impressum's provider card. */
  children?: ReactNode
}

/** Impressum and Datenschutzerklärung: one narrow reading column (Impressum.dc.html). */
export function LegalPage({ breadcrumb, heading, page, children }: LegalPageProps) {
  return (
    <section>
      <div className={styles.inner}>
        <Breadcrumbs items={[{ label: breadcrumb }]} className="in1" />
        <h1 className={`serif in2 ${styles.heading}`}>{heading}</h1>
        {page.updatedOnLabel ? (
          <p className={`in3 ${styles.updated}`}>
            {legalCopy.updatedPrefix} {page.updatedOnLabel}
          </p>
        ) : null}
        {children}
        {page.content ? (
          <LegalText content={page.content} />
        ) : (
          <p className={styles.pending}>{legalCopy.pending}</p>
        )}
      </div>
    </section>
  )
}
