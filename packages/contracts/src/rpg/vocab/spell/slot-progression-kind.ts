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
    description:
      'Uses a small number of same-level spell slots that refresh after a Short or Long Rest.',
  },
} as const satisfies Record<string, GameTermEntry>

export type SlotProgressionKindId = keyof typeof SLOT_PROGRESSION_KIND_ENTRIES

export const SLOT_PROGRESSION_KIND_IDS = [
  'full-caster',
  'half-caster',
  'pact-magic',
] as const satisfies readonly SlotProgressionKindId[]

export function isSlotProgressionKindId(id: string): id is SlotProgressionKindId {
  return (SLOT_PROGRESSION_KIND_IDS as readonly string[]).includes(id)
}

export function getSlotProgressionKindEntry(id: string): GameTermEntry | undefined {
  if (!isSlotProgressionKindId(id)) return undefined
  return SLOT_PROGRESSION_KIND_ENTRIES[id]
}
