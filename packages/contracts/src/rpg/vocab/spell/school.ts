import type { z } from 'zod'

import { formatVocabularySlugLabel } from '../format-slug-label'
import type { VocabularyTerm } from '../types'
import { vocabularyOptionIdSchema, type VocabularyOptionSetId } from '../vocabulary'

// ---------------------------------------------------------------------------
// Schools of magic — open vocabulary set for spell metadata.
// ---------------------------------------------------------------------------

export const SPELL_SCHOOL_TERM = {
  label: 'School of Magic',
  description: 'The magical tradition a spell belongs to.',
  sentence: {
    singular: 'school of magic',
    plural: 'schools of magic',
  },
} as const satisfies VocabularyTerm

export const SPELL_SCHOOL_SET_ID = 'spell-schools' as const satisfies VocabularyOptionSetId

/**
 * Primitive shape for stored spell school ids. Catalog membership is validated
 * against the campaign-resolved vocabulary.
 */
export const spellSchoolIdSchema = vocabularyOptionIdSchema

export type SpellSchoolId = z.infer<typeof spellSchoolIdSchema>

/** Returns a display label — title-cased slug fallback when seed label is unknown. */
export function getSpellSchoolLabel(id: string): string {
  return formatVocabularySlugLabel(id)
}
