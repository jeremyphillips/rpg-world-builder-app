import { vocabEnumFromEntries, keysFromEntries } from '../enum-schema'
import type { GameTermEntry, VocabularyTerm } from '../types'

// ---------------------------------------------------------------------------
// Spell function tags — closed browse/filter vocabulary for spell discovery.
// ---------------------------------------------------------------------------

export const SPELL_FUNCTION_TAG_TERM = {
  label: 'Spell Function Tag',
  description: 'A browse/filter tag describing what a spell accomplishes.',
  sentence: {
    singular: 'spell function tag',
    plural: 'spell function tags',
  },
} as const satisfies VocabularyTerm

export const SPELL_FUNCTION_TAG_ENTRIES = {
  communication: {
    label: 'Communication',
    description: 'Enables speech or understanding across barriers.',
  },
  creation: { label: 'Creation', description: 'Creates objects, light, or other effects.' },
  exploration: { label: 'Exploration', description: 'Aids travel, navigation, or discovery.' },
  teleportation: {
    label: 'Teleportation',
    description: 'Moves targets instantly across distance.',
  },
  foreknowledge: { label: 'Foreknowledge', description: 'Reveals future or hidden information.' },
  deception: { label: 'Deception', description: 'Conceals, disguises, or misleads.' },
  social: { label: 'Social', description: 'Aids interaction, influence, or negotiation.' },
  environment: {
    label: 'Environment',
    description: 'Alters or interacts with surroundings or weather.',
  },
  utility: { label: 'Utility', description: 'General-purpose non-combat assistance.' },
  'shape-changing': { label: 'Shape changing', description: 'Alters form or appearance.' },
} as const satisfies Record<string, GameTermEntry>

export type SpellFunctionTag = keyof typeof SPELL_FUNCTION_TAG_ENTRIES

export const SPELL_FUNCTION_TAGS = keysFromEntries(SPELL_FUNCTION_TAG_ENTRIES)

export const spellFunctionTagSchema = vocabEnumFromEntries(SPELL_FUNCTION_TAG_ENTRIES)

/** Returns the display label for a spell function tag. Falls back to the raw value. */
export function getSpellFunctionTagLabel(id: string): string {
  return SPELL_FUNCTION_TAG_ENTRIES[id as SpellFunctionTag]?.label ?? id
}
