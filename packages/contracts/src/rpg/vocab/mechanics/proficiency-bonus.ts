import type { VocabularyTerm } from '../types'

// ---------------------------------------------------------------------------
// Proficiency Bonus — edition-wide bonus tied to challenge or character level.
// ---------------------------------------------------------------------------

export const PROFICIENCY_BONUS_TERM = {
  label: 'Proficiency Bonus',
  compactLabel: 'PB',
  description:
    'A bonus added to rolls when a creature is proficient with a save, skill, weapon, or similar.',
  sentence: {
    singular: 'proficiency bonus',
    plural: 'proficiency bonuses',
  },
} as const satisfies VocabularyTerm
