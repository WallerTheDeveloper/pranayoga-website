import { CertificateIcon } from '@/components/icons/UiIcons'
import { WhatsAppButton } from '@/components/ui/WhatsAppButton'
import { sharedCopy } from '@/content/copy/shared'
import type { BusinessSettingsView, CourseSummary } from '@/content/types'
import { routes } from '@/lib/routes'

import { CoursesDropdown } from './CoursesDropdown'
import { LogoLink } from './Logo'
import { MobileMenu } from './MobileMenu'
import { MobileNav } from './MobileNav'
import { NavLink } from './NavLink'
import styles from './SiteHeader.module.css'

interface SiteHeaderProps {
  settings: BusinessSettingsView
  courses: readonly CourseSummary[]
}

/** Sticky header: logo, main nav with the courses dropdown, teacher-training pill, WhatsApp. */
export function SiteHeader({ settings, courses }: SiteHeaderProps) {
  const nav = sharedCopy.nav
  const whatsApp = sharedCopy.whatsApp
  const groupUrl = settings.whatsApp.groupUrl
  return (
    <header className={styles.root}>
      <div className={styles.inner}>
        <LogoLink
          linkClassName={styles.logoLink}
          className={styles.logo}
          alt={sharedCopy.brand.logoAlt}
          preload
        />
        <nav className={styles.nav} aria-label={nav.mainLabel}>
          <CoursesDropdown
            label={nav.courses}
            href={routes.courses()}
            courses={courses}
            hint={nav.dropdownHint}
            allCoursesLabel={nav.dropdownAllCourses}
            triggerClassName={styles.navLink}
          />
          <NavLink className={styles.navLink} href={routes.pricing()}>
            {nav.pricing}
          </NavLink>
          <NavLink className={styles.navLink} href={routes.about()}>
            {nav.about}
          </NavLink>
          <NavLink className={styles.navLink} href={routes.contact()}>
            {nav.contact}
          </NavLink>
        </nav>
        <div className={styles.actions}>
          <NavLink className={styles.pill} href={routes.teacherTraining()}>
            <CertificateIcon size={20} strokeWidth={1.8} />
            <span>{nav.teacherTraining}</span>
          </NavLink>
          {groupUrl ? (
            <WhatsAppButton
              href={groupUrl}
              label={whatsApp.bookLabel}
              ariaLabel={whatsApp.bookAriaLabel}
              size="small"
              className={styles.headerCta}
            />
          ) : null}
          <MobileMenu
            buttonLabel={nav.menu}
            dialogLabel={nav.menuDialogLabel}
            closeLabel={nav.closeMenu}
            logo={
              <LogoLink
                linkClassName={styles.logoLink}
                className={styles.logo}
                alt={sharedCopy.brand.logoAlt}
              />
            }
          >
            <MobileNav settings={settings} courses={courses} />
          </MobileMenu>
        </div>
      </div>
    </header>
  )
}
