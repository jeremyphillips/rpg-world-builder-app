import type { VocabularyOptionSetId } from '@rpg/contracts'
import { getVocabularyOptionSetTerm, VOCABULARY_OPTION_SET_IDS } from '@rpg/contracts'

import { vocabularyHubLabel } from '../vocabulary/term-labels'

export type HomebrewVocabularySetEntry = {
  setId: VocabularyOptionSetId
  label: string
  /** When false, hub card is omitted until the set manager is implemented. */
  enabled: boolean
}

const ENABLED_SETS = new Set<VocabularyOptionSetId>(['creature-types'])

/** Rules vocabulary sets surfaced on the Homebrew hub — expand as managers ship. */
export const HOMEBREW_VOCABULARY_SETS: readonly HomebrewVocabularySetEntry[] =
  VOCABULARY_OPTION_SET_IDS.map((setId) => ({
    setId,
    label: vocabularyHubLabel(getVocabularyOptionSetTerm(setId)),
    enabled: ENABLED_SETS.has(setId),
  }))

export function findVocabularySetEntry(setId: string): HomebrewVocabularySetEntry | undefined {
  return HOMEBREW_VOCABULARY_SETS.find((entry) => entry.setId === setId)
}

export const ENABLED_HOMEBREW_VOCABULARY_SETS = HOMEBREW_VOCABULARY_SETS.filter(
  (entry) => entry.enabled,
)
