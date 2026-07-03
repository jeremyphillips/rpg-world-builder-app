import { z } from 'zod'

import type { GameTermEntry } from '../types'

// ---------------------------------------------------------------------------
// Adventuring gear sub-kinds — discriminates items within `kind: adventuring_gear`.
// ---------------------------------------------------------------------------

export const GEAR_KINDS = [
  'general',
  'ammunition',
  'book',
  'arcane_focus',
  'druidic_focus',
  'holy_symbol',
  'container',
  'consumable',
] as const

export const gearKindSchema = z.enum(GEAR_KINDS)

export type GearKind = z.infer<typeof gearKindSchema>

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
  arcane_focus: {
    label: 'Arcane Focus',
    description: 'An arcane spellcasting focus such as a crystal, orb, rod, staff, or wand.',
    sentence: {
      plural: 'arcane focuses',
    },
  },
  druidic_focus: {
    label: 'Druidic Focus',
    description: 'A druidic spellcasting focus such as mistletoe, a totem, or a wooden staff.',
    sentence: {
      plural: 'druidic focuses',
    },
  },
  holy_symbol: {
    label: 'Holy Symbol',
    description: 'A divine spellcasting focus such as an amulet, emblem, or reliquary.',
  },
  container: {
    label: 'Container',
    description: 'A backpack, pouch, chest, or other item primarily used to store gear.',
  },
  consumable: {
    label: 'Consumable',
    description: 'An item consumed on use, such as rations, oil, or a potion of healing.',
  },
} as const satisfies Record<GearKind, GameTermEntry>

/** Returns the reference entry for a gear kind, if known. */
export function getGearKindEntry(kind: string): GameTermEntry | undefined {
  return GEAR_KIND_ENTRIES[kind as GearKind]
}

/** Returns the display label for a gear kind. Falls back to the raw value. */
export function getGearKindLabel(kind: string): string {
  return getGearKindEntry(kind)?.label ?? kind
}
