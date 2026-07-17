import { keysFromEntries, vocabEnumFromEntries } from '../enum-schema'

import type { GameTermEntry } from '../types'

// ---------------------------------------------------------------------------
// Adventuring gear sub-kinds — discriminates items within `kind: adventuring_gear`.
// ---------------------------------------------------------------------------

export const GEAR_KIND_ENTRIES = {
  general: {
    label: 'General',
    description: 'Standard adventuring gear without a more specific classification.',
    sentence: {
      singular: 'piece of adventuring gear',
      plural: 'pieces of adventuring gear',
    },
  },
  ammunition: {
    label: 'Ammunition',
    description:
      'Arrows, bolts, sling bullets, and similar consumable projectiles sold in bundles.',
    sentence: {
      singular: 'piece of ammunition',
      plural: 'pieces of ammunition',
    },
  },
  book: {
    label: 'Book',
    description: 'A reference or lore volume, such as occult texts used by Warlocks.',
  },
  spellcasting: {
    label: 'Spellcasting',
    description:
      'Spellcasting gear such as foci, a holy symbol, or a spellbook. Use spellcasting kind for the specific sub-classification.',
  },
  container: {
    label: 'Container',
    description: 'A backpack, pouch, chest, or other item primarily used to store gear.',
  },
  consumable: {
    label: 'Consumable',
    description: 'An item consumed on use, such as rations, oil, or a potion of healing.',
  },
} as const satisfies Record<string, GameTermEntry>

export type GearKind = keyof typeof GEAR_KIND_ENTRIES

export const GEAR_KINDS = keysFromEntries(GEAR_KIND_ENTRIES)

export const gearKindSchema = vocabEnumFromEntries(GEAR_KIND_ENTRIES)

/** Returns the reference entry for a gear kind, if known. */
export function getGearKindEntry(kind: string): GameTermEntry | undefined {
  return GEAR_KIND_ENTRIES[kind as GearKind]
}

/** Returns the display label for a gear kind. Falls back to the raw value. */
export function getGearKindLabel(kind: string): string {
  return getGearKindEntry(kind)?.label ?? kind
}
