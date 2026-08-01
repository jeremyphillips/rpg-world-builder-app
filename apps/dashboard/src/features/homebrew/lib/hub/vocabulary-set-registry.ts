import type { VocabularyCategory, VocabularyOptionSetId } from '@rpg/contracts'
import {
  BROWSABLE_VOCABULARY_CATEGORIES,
  findBrowsableVocabularyCategory,
  getVocabularyCategory,
} from '@rpg/contracts'

export type GameTermsVocabularyCategory = VocabularyCategory

/** Browsable Game Terms categories — thin projection of contract SSOT. */
export const GAME_TERMS_VOCABULARY_CATEGORIES: readonly GameTermsVocabularyCategory[] =
  BROWSABLE_VOCABULARY_CATEGORIES

export function findGameTermsCategory(setId: string): GameTermsVocabularyCategory | undefined {
  return findBrowsableVocabularyCategory(setId)
}

export function getGameTermsCategory(setId: VocabularyOptionSetId): GameTermsVocabularyCategory {
  return getVocabularyCategory(setId)
}

/** @deprecated Use {@link GAME_TERMS_VOCABULARY_CATEGORIES}. */
export const HOMEBREW_VOCABULARY_SETS = GAME_TERMS_VOCABULARY_CATEGORIES

/** @deprecated Use {@link findGameTermsCategory}. */
export const findVocabularySetEntry = findGameTermsCategory

/** @deprecated Use browse categories from SSOT. */
export const ENABLED_HOMEBREW_VOCABULARY_SETS = GAME_TERMS_VOCABULARY_CATEGORIES

/** @deprecated Use category setId list from SSOT. */
export const ENABLED_VOCABULARY_SET_IDS = GAME_TERMS_VOCABULARY_CATEGORIES.map(
  (entry) => entry.setId,
)

export type HomebrewVocabularySetEntry = GameTermsVocabularyCategory
