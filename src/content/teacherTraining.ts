import { CACHE_TAGS } from '@/cache/tags'

import { toTeacherTraining, toTeacherTrainingPage } from './mappers/teacherTraining'
import { READ_OPTIONS, getPayloadClient, readContent } from './source'
import type { TeacherTrainingPageView, TeacherTrainingView } from './types'

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

/** The teacher-training page: dates, prices, topics, requirements and the flyer. */
export function getTeacherTrainingPage(): Promise<TeacherTrainingPageView> {
  return readContent({
    key: ['teacher-training-page'],
    tags: [CACHE_TAGS.teacherTraining, CACHE_TAGS.media],
    load: async (mode) => {
      const payload = await getPayloadClient()
      const doc = await payload.findGlobal({
        slug: 'teacher-training',
        ...READ_OPTIONS[mode],
        depth: 1,
      })
      return toTeacherTrainingPage(doc)
    },
  })
}
