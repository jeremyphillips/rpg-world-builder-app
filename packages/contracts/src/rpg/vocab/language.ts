import { z } from 'zod'

import { formatVocabularySlugLabel } from './format-slug-label'
import {
  vocabularyOptionIdSchema,
  vocabularySeedOptionSchema,
  type VocabularyOptionSetId,
} from './vocabulary'

// ---------------------------------------------------------------------------
// Languages — open vocabulary set. Standard/rare grouping stays on seed rows
// (`languageSeedOptionSchema.category`) for grants and character creation.
// ---------------------------------------------------------------------------

export const LANGUAGE_CATEGORIES = ['standard', 'rare'] as const

export const languageCategorySchema = z.enum(LANGUAGE_CATEGORIES)

export type LanguageCategory = z.infer<typeof languageCategorySchema>

export const LANGUAGE_SET_ID = 'languages' as const satisfies VocabularyOptionSetId

/** Extended catalog seed row — category is validated at catalog load. */
export const languageSeedOptionSchema = vocabularySeedOptionSchema.extend({
  category: languageCategorySchema,
})

export type LanguageSeedOption = z.infer<typeof languageSeedOptionSchema>

/**
 * Primitive shape for stored language ids. Catalog membership is validated
 * against the campaign-resolved vocabulary.
 */
export const languageIdSchema = vocabularyOptionIdSchema

export type LanguageId = z.infer<typeof languageIdSchema>

/** Returns a display label — title-cased slug fallback when seed label is unknown. */
export function getLanguageLabel(id: string): string {
  return formatVocabularySlugLabel(id)
}
