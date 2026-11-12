/** The only way pages read content (docs/PLAN.md "Content strategy"). */
export { getPageCopy } from './copy'
export { getCourse, getCourses, getRelatedCourses } from './courses'
export { getCopyImages, type CopyImages } from './media'
export { getPriceGroups, getTrialOffer } from './prices'
export { findRedirect } from './redirects'
export { getBusinessSettings, getReviews, getTechnicalSettings } from './settings'
export { getTeacherTraining } from './teacherTraining'
export type * from './types'
