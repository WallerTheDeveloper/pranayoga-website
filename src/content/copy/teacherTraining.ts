/**
 * Fixed words of the teacher-training teaser (Komponenten.dc.html §07). Heading, text, facts,
 * start month and price come from the `teacher-training` global.
 */
export const teacherTrainingCopy = {
  teaser: {
    label: 'Yogaausbildung',
    /** "Yogaausbildung · Start März 2027" */
    startPrefix: 'Start',
    button: 'Zur Yogaausbildung',
    /** Under the price when the admin left the price note empty. */
    priceTerm: 'Gesamtpreis',
  },
} as const
