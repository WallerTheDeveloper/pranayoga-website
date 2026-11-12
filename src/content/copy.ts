import { courseCopy } from './copy/course'
import { coursesCopy } from './copy/courses'
import { homeCopy } from './copy/home'
import { sharedCopy } from './copy/shared'
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
  shared: sharedCopy,
  teacher: teacherCopy,
  teacherTraining: teacherTrainingCopy,
} as const

export type PageCopyKey = keyof typeof pageCopy
export type PageCopy<K extends PageCopyKey> = (typeof pageCopy)[K]

export async function getPageCopy<K extends PageCopyKey>(key: K): Promise<PageCopy<K>> {
  return pageCopy[key]
}
