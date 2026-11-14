'use client'

import Image from 'next/image'
import { useCallback, useRef, useState, type KeyboardEvent, type MouseEvent } from 'react'

import { ArrowIcon, ArrowLeftIcon, CloseIcon, PlusIcon } from '@/components/icons/UiIcons'
import { ContainedImage } from '@/components/ui/TreatedImage'
import { aboutCopy } from '@/content/copy/about'
import type { ImageData } from '@/content/types'

import styles from './CertificateGallery.module.css'

export interface Certificate {
  image: ImageData
  caption: string
}

interface CertificateGalleryProps {
  certificates: readonly Certificate[]
}

// Imported here rather than passed in: the counter is a function, which cannot cross from a
// server component into this client component.
const copy = {
  ...aboutCopy.certificates.lightbox,
  zoom: aboutCopy.certificates.zoom,
}

/** Wraps around at both ends: after the last certificate comes the first. */
export function stepIndex(current: number, step: number, total: number): number {
  return (current + step + total) % total
}

/**
 * Certificate thumbnails that open a full-size lightbox (design `.certbtn`, `.lb`). The lightbox
 * is a native modal <dialog>: focus stays inside, the page behind is inert and Escape closes it.
 * Arrow keys step through the certificates; focus returns to the thumbnail that opened it.
 */
export function CertificateGallery({ certificates }: CertificateGalleryProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const openerRefs = useRef<(HTMLButtonElement | null)[]>([])
  const [index, setIndex] = useState<number | null>(null)
  const total = certificates.length

  const open = (position: number) => {
    setIndex(position)
    const dialog = dialogRef.current
    if (dialog && !dialog.open) dialog.showModal()
  }

  const close = useCallback(() => {
    const dialog = dialogRef.current
    if (dialog?.open) dialog.close()
  }, [])

  const step = useCallback(
    (direction: number) =>
      setIndex((current) => (current === null ? current : stepIndex(current, direction, total))),
    [total],
  )

  const handleKeyDown = (event: KeyboardEvent<HTMLDialogElement>) => {
    if (event.key === 'ArrowRight') {
      event.preventDefault()
      step(1)
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault()
      step(-1)
    }
  }

  // A click on the dark area around the certificate (the dialog itself) closes it.
  const handleClick = (event: MouseEvent<HTMLDialogElement>) => {
    if (event.target === event.currentTarget) close()
  }

  const handleClose = () => {
    const opener = index === null ? null : openerRefs.current[index]
    setIndex(null)
    opener?.focus()
  }

  const current = index === null ? null : certificates[index]

  return (
    <>
      <ul className={styles.grid}>
        {certificates.map((certificate, position) => (
          <li key={certificate.image.src}>
            <figure className={styles.figure}>
              <button
                ref={(element) => {
                  openerRefs.current[position] = element
                }}
                className={styles.opener}
                type="button"
                aria-haspopup="dialog"
                // Starts with the visible hint, so speech input can say what it sees.
                aria-label={`${copy.zoom}: ${certificate.caption}`}
                onClick={() => open(position)}
              >
                <ContainedImage
                  image={certificate.image}
                  alt=""
                  sizes="(max-width: 700px) 100vw, 400px"
                  aspectRatio="4 / 3"
                  className={styles.thumb}
                />
                <span className={styles.zoomHint} aria-hidden="true">
                  <PlusIcon size={18} />
                  <span>{copy.zoom}</span>
                </span>
              </button>
              <figcaption className={styles.caption}>{certificate.caption}</figcaption>
            </figure>
          </li>
        ))}
      </ul>
      <dialog
        ref={dialogRef}
        className={styles.lightbox}
        aria-label={copy.label}
        onKeyDown={handleKeyDown}
        onClick={handleClick}
        onClose={handleClose}
      >
        {current && index !== null ? (
          <>
            <div className={styles.top}>
              <p className={styles.counter} aria-live="polite">
                {copy.counter(index + 1, total)}
              </p>
              <button className={styles.control} type="button" onClick={close} autoFocus>
                <CloseIcon size={20} />
                <span>{copy.close}</span>
              </button>
            </div>
            <Image
              key={current.image.src}
              className={styles.image}
              src={current.image.src}
              alt={current.image.alt}
              width={current.image.width}
              height={current.image.height}
              sizes="(max-width: 1024px) 100vw, 1024px"
            />
            <p className={styles.lightboxCaption}>{current.caption}</p>
            {total > 1 ? (
              <div className={styles.nav}>
                <button className={styles.control} type="button" onClick={() => step(-1)}>
                  <ArrowLeftIcon size={20} />
                  <span>{copy.previous}</span>
                </button>
                <button className={styles.control} type="button" onClick={() => step(1)}>
                  <span>{copy.next}</span>
                  <ArrowIcon size={20} />
                </button>
              </div>
            ) : null}
          </>
        ) : null}
      </dialog>
    </>
  )
}
