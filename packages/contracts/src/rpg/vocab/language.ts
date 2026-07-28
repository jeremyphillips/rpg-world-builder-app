import { type z } from 'zod'

import { keysFromEntries, vocabEnumFromEntries } from './enum-schema'

import { formatVocabularySlugLabel } from './format-slug-label'
import { getTermSentenceForm, type GameTermEntry, type VocabularyTerm } from './types'
import {
  vocabularyOptionIdSchema,
  vocabularySeedOptionSchema,
  type VocabularyOptionSetId,
} from './vocabulary'

// ---------------------------------------------------------------------------
// Languages — open vocabulary set. Standard/rare grouping stays on seed rows
// (`languageSeedOptionSchema.category`) for grants and character creation.
// ---------------------------------------------------------------------------

export const LANGUAGE_CATEGORY_TERM = {
  label: 'Language Category',
  description: 'Whether a language is commonly known or rare.',
  sentence: {
    singular: 'language category',
    plural: 'language categories',
  },
} as const satisfies VocabularyTerm

export const LANGUAGE_CATEGORY_ENTRIES = {
  standard: {
    label: 'Standard',
    description: 'Commonly known languages available to most characters.',
    sentence: {
      singular: 'standard language',
      plural: 'standard languages',
    },
  },
  rare: {
    label: 'Rare',
    description: 'Less common languages available through specific features or campaign options.',
    sentence: {
      singular: 'rare language',
      plural: 'rare languages',
    },
  },
} as const satisfies Record<string, GameTermEntry>

export type LanguageCategory = keyof typeof LANGUAGE_CATEGORY_ENTRIES

export const LANGUAGE_CATEGORIES = keysFromEntries(LANGUAGE_CATEGORY_ENTRIES)

export const languageCategorySchema = vocabEnumFromEntries(LANGUAGE_CATEGORY_ENTRIES)

export const LANGUAGE_SET_ID = 'languages' as const satisfies VocabularyOptionSetId

export const LANGUAGE_TERM = {
  label: 'Language',
  description: 'A language a creature can speak, read, or write.',
  sentence: {
    singular: 'language',
    plural: 'languages',
  },
} as const satisfies VocabularyTerm

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

/** Returns the reference entry for a language category, if known. */
export function getLanguageCategoryEntry(category: string): GameTermEntry | undefined {
  return LANGUAGE_CATEGORY_ENTRIES[category as LanguageCategory]
}

/** Returns the display label for a language category. Falls back to the raw value. */
export function getLanguageCategoryLabel(category: string): string {
  return getLanguageCategoryEntry(category)?.label ?? category
}

/** Returns an entry-shaped fallback for an open-vocabulary language id. */
export function getLanguageEntry(id: string): GameTermEntry {
  const label = getLanguageLabel(id)
  return {
    label,
    description: '',
    sentence: {
      singular: label,
      plural: label,
    },
  }
}

/** Counted noun phrase for generated language prose. */
export function getLanguageSentenceForm(id: string, count = 1): string {
  return getTermSentenceForm(getLanguageEntry(id), count)
}

/** Counted noun phrase for generated language-category prose. */
export function getLanguageCategorySentenceForm(category: string, count = 1): string {
  const entry = getLanguageCategoryEntry(category)
  if (entry) return getTermSentenceForm(entry, count)
  return getTermSentenceForm({ label: category, description: '' }, count)
}

/** Counted noun phrase for language proficiency grants (e.g. "language" / "languages"). */
export function getLanguageProficiencySentenceForm(count = 1): string {
  return count === 1 ? 'language' : 'languages'
}
