import { keysFromEntries } from '../enum-schema'
import type { GameTermEntry, VocabularyTerm } from '../types'

// ---------------------------------------------------------------------------
// Slot progression kind — closed vocabulary for standard SRD slot tables.
// Custom campaign progressions keep free-string ids; only these three expose
// tooltip descriptions in builder surfaces.
// ---------------------------------------------------------------------------

export const SLOT_PROGRESSION_KIND_TERM = {
  label: 'Slot Progression',
  description: 'How a spellcasting class gains spell slots as it advances in level.',
  sentence: {
    singular: 'slot progression',
    plural: 'slot progressions',
  },
} as const satisfies VocabularyTerm

export const SLOT_PROGRESSION_KIND_ENTRIES = {
  'full-caster': {
    label: 'Full caster',
    description:
      'Gains spell slots at the standard spellcasting progression, eventually reaching 9th-level spell slots.',
  },
  'half-caster': {
    label: 'Half caster',
    description: 'Gains spell slots more gradually, eventually reaching 5th-level spell slots.',
  },
  'pact-magic': {
    label: 'Pact Magic',
    description: 'Uses a small number of spell slots that are always the same level.',
  },
} as const satisfies Record<string, GameTermEntry>

export type SlotProgressionKindId = keyof typeof SLOT_PROGRESSION_KIND_ENTRIES

/** Standard ruleset id for Pact Magic slot progression (and the class granting feature id). */
export const PACT_MAGIC_SLOT_PROGRESSION_KIND_ID =
  'pact-magic' as const satisfies SlotProgressionKindId

export const SLOT_PROGRESSION_KIND_IDS = keysFromEntries(SLOT_PROGRESSION_KIND_ENTRIES)

export function isSlotProgressionKindId(id: string): id is SlotProgressionKindId {
  return (SLOT_PROGRESSION_KIND_IDS as readonly string[]).includes(id)
}

export function getSlotProgressionKindEntry(id: string): GameTermEntry | undefined {
  if (!isSlotProgressionKindId(id)) return undefined
  return SLOT_PROGRESSION_KIND_ENTRIES[id]
}

export function getSlotProgressionKindLabel(id: string): string {
  return getSlotProgressionKindEntry(id)?.label ?? id
}

/** Class feature label for the standard leveled spellcasting progression row. */
export const SPELLCASTING_CLASS_FEATURE_LABEL = 'Spellcasting' as const

export type SpellcastingFeatureLabelProgression = { kind: 'leveled' | 'pact' }

/** Feature-table label derived from slot progression kind. */
export function spellcastingFeatureLabelForSlotProgression(
  progression: SpellcastingFeatureLabelProgression,
): string {
  return progression.kind === 'pact'
    ? getSlotProgressionKindLabel(PACT_MAGIC_SLOT_PROGRESSION_KIND_ID)
    : SPELLCASTING_CLASS_FEATURE_LABEL
}
