import Link from 'next/link'

import { SocialButton } from '@/components/ui/SocialButton'
import { sharedCopy } from '@/content/copy/shared'
import type { BusinessSettingsView, CourseSummary } from '@/content/types'
import { routes } from '@/lib/routes'

import { Logo } from './Logo'
import styles from './SiteFooter.module.css'

interface SiteFooterProps {
  settings: BusinessSettingsView
  courses: readonly CourseSummary[]
  year: number
}

export function SiteFooter({ settings, courses, year }: SiteFooterProps) {
  const copy = sharedCopy.footer
  const nav = sharedCopy.nav
  const { contact, social, whatsApp } = settings
  return (
    <footer className={`${styles.root} paper`}>
      <div className={styles.inner}>
        <div className={styles.columns}>
          <div className={styles.brand}>
            <Logo variant="stacked" alt={sharedCopy.brand.footerLogoAlt} className={styles.logo} />
            {contact.street || contact.cityLine ? (
              <address className={styles.address}>
                {contact.street}
                {contact.street && contact.cityLine ? <br /> : null}
                {contact.cityLine}
              </address>
            ) : null}
            {social.instagramUrl || social.facebookUrl ? (
              <div className={styles.socials}>
                {social.instagramUrl ? (
                  <SocialButton platform="instagram" href={social.instagramUrl} />
                ) : null}
                {social.facebookUrl ? (
                  <SocialButton platform="facebook" href={social.facebookUrl} />
                ) : null}
              </div>
            ) : null}
          </div>
          <div className={styles.column}>
            <p className={styles.heading}>{copy.contactHeading}</p>
            {contact.phoneHref && contact.phoneDisplay ? (
              <a className={styles.link} href={contact.phoneHref}>
                {contact.phoneDisplay}
              </a>
            ) : null}
            {contact.emailHref && contact.email ? (
              <a className={styles.link} href={contact.emailHref}>
                {contact.email}
              </a>
            ) : null}
            {whatsApp.groupUrl ? (
              <a
                className={styles.link}
                href={whatsApp.groupUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={copy.whatsAppGroupAriaLabel}
              >
                {copy.whatsAppGroup}
              </a>
            ) : null}
          </div>
          {courses.length > 0 ? (
            <nav className={styles.column} aria-label={copy.coursesHeading}>
              <p className={styles.heading}>{copy.coursesHeading}</p>
              {courses.map((course) => (
                <Link key={course.slug} className={styles.link} href={course.href}>
                  {course.title}
                </Link>
              ))}
            </nav>
          ) : null}
          <nav className={styles.column} aria-label={copy.studioHeading}>
            <p className={styles.heading}>{copy.studioHeading}</p>
            <Link className={styles.link} href={routes.about()}>
              {nav.about}
            </Link>
            <Link className={styles.link} href={routes.teacherTraining()}>
              {nav.teacherTraining}
            </Link>
            <Link className={styles.link} href={routes.pricing()}>
              {nav.pricing}
            </Link>
            <Link className={styles.link} href={routes.signup()}>
              {copy.signup}
            </Link>
            <Link className={styles.link} href={routes.contact()}>
              {nav.contact}
            </Link>
          </nav>
        </div>
        <div className={styles.bottom}>
          <span>{copy.copyright(year)}</span>
          <span className={styles.legal}>
            <Link className={styles.link} href={routes.legalNotice()}>
              {copy.legalNotice}
            </Link>
            <Link className={styles.link} href={routes.privacyPolicy()}>
              {copy.privacyPolicy}
            </Link>
          </span>
        </div>
      </div>
    </footer>
  )
}
