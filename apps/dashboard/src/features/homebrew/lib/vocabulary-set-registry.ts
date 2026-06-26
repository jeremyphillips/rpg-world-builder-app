import type { VocabularyOptionSetId } from '@rpg/contracts'

export type HomebrewVocabularySetEntry = {
  setId: VocabularyOptionSetId
  label: string
  /** When false, hub card is omitted until the set manager is implemented. */
  enabled: boolean
}

/** Rules vocabulary sets surfaced on the Homebrew hub — expand as managers ship. */
export const HOMEBREW_VOCABULARY_SETS: readonly HomebrewVocabularySetEntry[] = [
  { setId: 'creature-types', label: 'Creature Types', enabled: true },
  { setId: 'damage-types', label: 'Damage Types', enabled: false },
  { setId: 'conditions', label: 'Conditions', enabled: false },
  { setId: 'languages', label: 'Languages', enabled: false },
  { setId: 'senses', label: 'Senses', enabled: false },
  { setId: 'sizes', label: 'Sizes', enabled: false },
  { setId: 'spell-schools', label: 'Spell Schools', enabled: false },
  { setId: 'weapon-properties', label: 'Weapon Properties', enabled: false },
  { setId: 'equipment-categories', label: 'Equipment Categories', enabled: false },
]

export function findVocabularySetEntry(setId: string): HomebrewVocabularySetEntry | undefined {
  return HOMEBREW_VOCABULARY_SETS.find((entry) => entry.setId === setId)
}

export const ENABLED_HOMEBREW_VOCABULARY_SETS = HOMEBREW_VOCABULARY_SETS.filter(
  (entry) => entry.enabled,
)
