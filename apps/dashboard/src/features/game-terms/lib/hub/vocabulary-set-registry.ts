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
