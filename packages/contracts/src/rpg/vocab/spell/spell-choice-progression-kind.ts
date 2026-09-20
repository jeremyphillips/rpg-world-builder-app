import type { GameTermEntry, VocabularyTerm } from '../types'
import { vocabEnumFromEntries, keysFromEntries } from '../enum-schema'

// ---------------------------------------------------------------------------
// Spell choice progression kind — capacity vs gain semantics.
// ---------------------------------------------------------------------------

export const SPELL_CHOICE_PROGRESSION_KIND_TERM = {
  label: 'Spell Choice Progression Kind',
  description: 'Whether a progression row expresses capacity or per-level gain.',
  sentence: {
    singular: 'spell choice progression kind',
    plural: 'spell choice progression kinds',
  },
} as const satisfies VocabularyTerm

export const SPELL_CHOICE_PROGRESSION_KIND_ENTRIES = {
  capacity: {
    label: 'Capacity',
    description:
      'At this level, the destination collection may contain N selections (fill-forward between authored rows).',
  },
  gain: {
    label: 'Gain',
    description:
      'At this level, add N selections to a persistent collection (missing rows are zero).',
  },
} as const satisfies Record<string, GameTermEntry>

export type SpellChoiceProgressionKind = keyof typeof SPELL_CHOICE_PROGRESSION_KIND_ENTRIES

export const SPELL_CHOICE_PROGRESSION_KINDS = keysFromEntries(SPELL_CHOICE_PROGRESSION_KIND_ENTRIES)

export const spellChoiceProgressionKindSchema = vocabEnumFromEntries(
  SPELL_CHOICE_PROGRESSION_KIND_ENTRIES,
)

export function getSpellChoiceProgressionKindEntry(id: string): GameTermEntry | undefined {
  return SPELL_CHOICE_PROGRESSION_KIND_ENTRIES[id as SpellChoiceProgressionKind]
}
