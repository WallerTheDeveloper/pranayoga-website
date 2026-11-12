import { homeCopy } from './copy/home'
import { sharedCopy } from './copy/shared'
import { teacherCopy } from './copy/teacher'

/**
 * Typed German copy behind the same repository interface as the admin data (docs/PLAN.md
 * "Content strategy"). Async, so a text can move into Payload without touching the callers.
 */
const pageCopy = {
  home: homeCopy,
  shared: sharedCopy,
  teacher: teacherCopy,
} as const

export type PageCopyKey = keyof typeof pageCopy
export type PageCopy<K extends PageCopyKey> = (typeof pageCopy)[K]

export async function getPageCopy<K extends PageCopyKey>(key: K): Promise<PageCopy<K>> {
  return pageCopy[key]
}
