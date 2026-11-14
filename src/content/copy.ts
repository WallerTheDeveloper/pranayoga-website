import { aboutCopy } from './copy/about'
import { contactCopy } from './copy/contact'
import { courseCopy } from './copy/course'
import { coursesCopy } from './copy/courses'
import { formsCopy } from './copy/forms'
import { homeCopy } from './copy/home'
import { legalCopy } from './copy/legal'
import { pricingCopy } from './copy/pricing'
import { sharedCopy } from './copy/shared'
import { signupCopy } from './copy/signup'
import { statusCopy } from './copy/status'
import { teacherCopy } from './copy/teacher'
import { teacherTrainingCopy } from './copy/teacherTraining'

/**
 * Typed German copy behind the same repository interface as the admin data (docs/PLAN.md
 * "Content strategy"). Async, so a text can move into Payload without touching the callers.
 */
const pageCopy = {
  home: homeCopy,
  courses: coursesCopy,
  course: courseCopy,
  about: aboutCopy,
  pricing: pricingCopy,
  signup: signupCopy,
  contact: contactCopy,
  legal: legalCopy,
  status: statusCopy,
  forms: formsCopy,
  shared: sharedCopy,
  teacher: teacherCopy,
  teacherTraining: teacherTrainingCopy,
} as const

export type PageCopyKey = keyof typeof pageCopy
export type PageCopy<K extends PageCopyKey> = (typeof pageCopy)[K]

export async function getPageCopy<K extends PageCopyKey>(key: K): Promise<PageCopy<K>> {
  return pageCopy[key]
}
