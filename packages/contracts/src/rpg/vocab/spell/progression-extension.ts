import type { GameTermEntry, VocabularyTerm } from '../types'
import { vocabEnumFromEntries, keysFromEntries } from '../enum-schema'

// ---------------------------------------------------------------------------
// Progression extension — policy for levels beyond authored progression rows.
// ---------------------------------------------------------------------------

export const PROGRESSION_EXTENSION_TERM = {
  label: 'Progression Extension',
  description: 'How progression values resolve for levels beyond authored data.',
  sentence: {
    singular: 'progression extension policy',
    plural: 'progression extension policies',
  },
} as const satisfies VocabularyTerm

export const PROGRESSION_EXTENSION_ENTRIES = {
  carryForward: {
    label: 'Carry forward',
    description:
      'Levels beyond the last authored row reuse the last authored value (capacity) or slot row.',
  },
  zero: {
    label: 'Zero',
    description: 'Levels beyond authored data resolve to zero (typical for gain curves).',
  },
  explicit: {
    label: 'Explicit',
    description:
      'Levels beyond authored data are unresolved and must be authored before use — never fabricated.',
  },
} as const satisfies Record<string, GameTermEntry>

export type ProgressionExtension = keyof typeof PROGRESSION_EXTENSION_ENTRIES

export const PROGRESSION_EXTENSIONS = keysFromEntries(PROGRESSION_EXTENSION_ENTRIES)

export const progressionExtensionSchema = vocabEnumFromEntries(PROGRESSION_EXTENSION_ENTRIES)

export function getProgressionExtensionEntry(id: string): GameTermEntry | undefined {
  return PROGRESSION_EXTENSION_ENTRIES[id as ProgressionExtension]
}

export function getProgressionExtensionLabel(id: string): string {
  return getProgressionExtensionEntry(id)?.label ?? id
}
