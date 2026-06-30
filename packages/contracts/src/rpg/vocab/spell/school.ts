import type { z } from 'zod'

import { formatVocabularySlugLabel } from '../format-slug-label'
import { vocabularyOptionIdSchema, type VocabularyOptionSetId } from '../vocabulary'

// ---------------------------------------------------------------------------
// Schools of magic — open vocabulary set for spell metadata.
// ---------------------------------------------------------------------------

export const SPELL_SCHOOL_SET_ID = 'spell-schools' as const satisfies VocabularyOptionSetId

/**
 * Primitive shape for stored spell school ids. Catalog membership is validated
 * against the campaign-resolved vocabulary.
 */
export const spellSchoolIdSchema = vocabularyOptionIdSchema

export type SpellSchoolId = z.infer<typeof spellSchoolIdSchema>

/** @deprecated Use `spellSchoolIdSchema`. */
export const spellSchoolSchema = spellSchoolIdSchema

/** @deprecated Use `SpellSchoolId`. */
export type SpellSchool = SpellSchoolId

/** Returns a display label — title-cased slug fallback when seed label is unknown. */
export function getSpellSchoolLabel(id: string): string {
  return formatVocabularySlugLabel(id)
}
