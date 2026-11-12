import { CACHE_TAGS } from '@/cache/tags'

import { toTeacherTraining } from './mappers/teacherTraining'
import { READ_OPTIONS, getPayloadClient, readContent } from './source'
import type { TeacherTrainingView } from './types'

/** The teacher training for the shared teaser, or null while it has no heading. */
export function getTeacherTraining(): Promise<TeacherTrainingView | null> {
  return readContent({
    key: ['teacher-training'],
    tags: [CACHE_TAGS.teacherTraining],
    load: async (mode) => {
      const payload = await getPayloadClient()
      const doc = await payload.findGlobal({
        slug: 'teacher-training',
        ...READ_OPTIONS[mode],
        depth: 0,
      })
      return toTeacherTraining(doc)
    },
  })
}
