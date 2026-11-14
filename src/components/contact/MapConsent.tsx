'use client'

import { useState } from 'react'

import { useHydrated } from '@/components/hooks/useHydrated'
import { ExternalArrowIcon, MapPinIcon } from '@/components/icons/UiIcons'
import { buttonClassName } from '@/components/ui/Button'
import { contactCopy } from '@/content/copy/contact'

import styles from './MapConsent.module.css'

interface MapConsentProps {
  /** Checked against https://www.google.com/maps/embed… by the content layer; null hides "Karte laden". */
  embedUrl: string | null
  /** "Weidkamp 176, 45356 Essen-Borbeck". */
  address: string
  privacyHref: string
}

/** Google Maps directions to the address, opened in the visitor's own maps app or browser. */
export function routeUrl(address: string): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`
}

/**
 * Two-click map: nothing is requested from Google until the visitor presses "Karte laden",
 * after a notice that data goes to Google. "Route planen" is a plain link and works without it.
 */
export function MapConsent({ embedUrl, address, privacyHref }: MapConsentProps) {
  const copy = contactCopy.map
  const [loaded, setLoaded] = useState(false)
  const hydrated = useHydrated()

  if (loaded && embedUrl) {
    return (
      <div className={styles.frameWrap}>
        <iframe
          className={styles.frame}
          src={embedUrl}
          title={copy.frameTitle(address)}
          loading="lazy"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        />
      </div>
    )
  }

  return (
    <div className={styles.placeholder}>
      <span className={styles.pin} aria-hidden="true">
        <MapPinIcon size={30} />
      </span>
      <p className={`serif ${styles.address}`}>{address}</p>
      {embedUrl ? (
        <p className={styles.notice}>
          {copy.notice} <a href={privacyHref}>{copy.privacyLink}</a>.
        </p>
      ) : null}
      <div className={styles.actions}>
        {embedUrl && hydrated ? (
          <button className={buttonClassName('dark')} type="button" onClick={() => setLoaded(true)}>
            {copy.load}
          </button>
        ) : null}
        <a
          className={buttonClassName('outline')}
          href={routeUrl(address)}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={copy.routeAriaLabel}
        >
          <span>{copy.route}</span>
          <ExternalArrowIcon size={18} />
        </a>
      </div>
    </div>
  )
}
