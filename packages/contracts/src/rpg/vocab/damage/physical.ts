import { vocabEnumFromEntries, keysFromEntries } from '../enum-schema'
import type { GameTermEntry, VocabularyTerm } from '../types'

// ---------------------------------------------------------------------------
// Physical damage — closed forever (3 SRD types). Weapons use this subset only;
// elemental and planar types live in the open `damage-types` vocabulary set.
// ---------------------------------------------------------------------------

export const PHYSICAL_DAMAGE_TYPE_TERM = {
  label: 'Physical Damage Type',
  description: 'Bludgeoning, piercing, or slashing damage from weapons and attacks.',
  sentence: {
    singular: 'physical damage type',
    plural: 'physical damage types',
  },
} as const satisfies VocabularyTerm

export const PHYSICAL_DAMAGE_TYPE_ENTRIES = {
  bludgeoning: {
    label: 'Bludgeoning',
    description:
      'Bludgeoning damage is delivered by a blunt instrument or a blow, fall, or constriction that does not use a cutting or piercing point.',
    sentence: {
      singular: 'bludgeoning damage',
      plural: 'bludgeoning damage',
    },
  },
  piercing: {
    label: 'Piercing',
    description:
      'Piercing damage is delivered by a strike that uses a point, such as a fang, arrow, or rapier.',
    sentence: {
      singular: 'piercing damage',
      plural: 'piercing damage',
    },
  },
  slashing: {
    label: 'Slashing',
    description:
      'Slashing damage is delivered by a cut from a sharp edge, such as an axe, claw, or greatsword.',
    sentence: {
      singular: 'slashing damage',
      plural: 'slashing damage',
    },
  },
} as const satisfies Record<string, GameTermEntry>

export type PhysicalDamageType = keyof typeof PHYSICAL_DAMAGE_TYPE_ENTRIES

export const PHYSICAL_DAMAGE_TYPE_IDS = keysFromEntries(PHYSICAL_DAMAGE_TYPE_ENTRIES)

export const physicalDamageTypeSchema = vocabEnumFromEntries(PHYSICAL_DAMAGE_TYPE_ENTRIES)

/** Returns the reference entry for a physical damage type id, if known. */
export function getPhysicalDamageTypeEntry(id: string): GameTermEntry | undefined {
  return PHYSICAL_DAMAGE_TYPE_ENTRIES[id as PhysicalDamageType]
}

/** Returns the display label for a physical damage type. Falls back to the raw value. */
export function getPhysicalDamageTypeLabel(id: string): string {
  return getPhysicalDamageTypeEntry(id)?.label ?? id
}
