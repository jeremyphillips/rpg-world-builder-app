import type { VocabularyOptionSetId } from '@rpg/contracts'
import {
  getVocabularyOptionSetTerm,
  getVocabularySetCapability,
  VOCABULARY_OPTION_SET_IDS,
  vocabularySetIdsWithOverview,
} from '@rpg/contracts'

import { vocabularyHubLabel } from '../vocabulary/term-labels'

export type HomebrewVocabularySetEntry = {
  setId: VocabularyOptionSetId
  label: string
  /** When false, hub card is omitted until the set manager is implemented. */
  enabled: boolean
}

/** Runtime-enabled vocabulary sets derived from contract capabilities. */
export const ENABLED_VOCABULARY_SET_IDS = vocabularySetIdsWithOverview()

/** Rules vocabulary sets surfaced on the Homebrew hub — expand via capabilities. */
export const HOMEBREW_VOCABULARY_SETS: readonly HomebrewVocabularySetEntry[] =
  VOCABULARY_OPTION_SET_IDS.map((setId) => ({
    setId,
    label: vocabularyHubLabel(getVocabularyOptionSetTerm(setId)),
    enabled: getVocabularySetCapability(setId).overview,
  }))

export function findVocabularySetEntry(setId: string): HomebrewVocabularySetEntry | undefined {
  return HOMEBREW_VOCABULARY_SETS.find((entry) => entry.setId === setId)
}

export const ENABLED_HOMEBREW_VOCABULARY_SETS = HOMEBREW_VOCABULARY_SETS.filter(
  (entry) => entry.enabled,
)
