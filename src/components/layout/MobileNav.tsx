import { WhatsAppBand } from '@/components/blocks/WhatsAppBand'
import { CourseIcon } from '@/components/icons/CourseIcons'
import { CertificateIcon } from '@/components/icons/UiIcons'
import { SocialButton } from '@/components/ui/SocialButton'
import { sharedCopy } from '@/content/copy/shared'
import type { BusinessSettingsView, CourseSummary } from '@/content/types'
import { routes } from '@/lib/routes'

import styles from './MobileNav.module.css'
import { NavLink } from './NavLink'

interface MobileNavProps {
  settings: BusinessSettingsView
  courses: readonly CourseSummary[]
}

/** Body of the full-screen menu: courses listed inline, then booking and socials. */
export function MobileNav({ settings, courses }: MobileNavProps) {
  const nav = sharedCopy.nav
  const { social } = settings
  return (
    <>
      <nav className={styles.nav} aria-label={nav.mobileLabel}>
        <NavLink className={`${styles.link} ${styles.linkNoRule}`} href={routes.courses()}>
          {nav.courses}
        </NavLink>
        <ul className={styles.sub} aria-label={nav.allCoursesLabel}>
          {courses.map((course) => (
            <li key={course.slug}>
              <NavLink className={styles.subLink} href={course.href}>
                <span className={styles.icon}>
                  <CourseIcon name={course.icon} size={28} />
                </span>
                <span>{course.title}</span>
              </NavLink>
            </li>
          ))}
        </ul>
        <NavLink className={styles.link} href={routes.pricing()}>
          {nav.pricing}
        </NavLink>
        <NavLink className={styles.link} href={routes.about()}>
          {nav.about}
        </NavLink>
        <NavLink className={styles.link} href={routes.contact()}>
          {nav.contact}
        </NavLink>
        <NavLink className={`${styles.link} ${styles.withIcon}`} href={routes.teacherTraining()}>
          <span className={styles.icon}>
            <CertificateIcon size={26} strokeWidth={1.7} />
          </span>
          <span>{nav.teacherTraining}</span>
        </NavLink>
      </nav>
      <WhatsAppBand groupUrl={settings.whatsApp.groupUrl} contact={settings.contact} />
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
    </>
  )
}
