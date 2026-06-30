import { z } from 'zod'

import type { GameTermEntry } from '../types'

// ---------------------------------------------------------------------------
// Magic item categories — DMG item types for filtering and display.
// ---------------------------------------------------------------------------

export const MAGIC_ITEM_CATEGORIES = [
  'weapon',
  'armor',
  'wondrous_item',
  'potion',
  'ring',
  'rod',
  'scroll',
  'staff',
  'wand',
  'other',
] as const

export const magicItemCategorySchema = z.enum(MAGIC_ITEM_CATEGORIES)

export type MagicItemCategory = z.infer<typeof magicItemCategorySchema>

export const MAGIC_ITEM_CATEGORY_ENTRIES = {
  weapon: {
    label: 'Weapon',
    description: 'A magic weapon such as a +1 longsword.',
  },
  armor: {
    label: 'Armor',
    description: 'Magic armor or a shield with an enhancement bonus.',
  },
  wondrous_item: {
    label: 'Wondrous Item',
    description: 'A miscellaneous magic item such as boots, bracers, or an amulet.',
  },
  potion: {
    label: 'Potion',
    description: 'A single-use liquid magic item.',
  },
  ring: {
    label: 'Ring',
    description: 'A magic ring worn on the finger.',
  },
  rod: {
    label: 'Rod',
    description: 'A scepter-like magic item.',
  },
  scroll: {
    label: 'Scroll',
    description: 'A spell scroll or similar one-use written magic.',
  },
  staff: {
    label: 'Staff',
    description: 'A magic staff, often a spell focus with charges or spells.',
  },
  wand: {
    label: 'Wand',
    description: 'A slender magic item that casts a limited set of spells.',
  },
  other: {
    label: 'Other',
    description: 'A magic item that does not fit another category.',
  },
} as const satisfies Record<MagicItemCategory, GameTermEntry>

/** Returns the display label for a magic item category. Falls back to the raw value. */
export function getMagicItemCategoryLabel(category: string): string {
  return MAGIC_ITEM_CATEGORY_ENTRIES[category as MagicItemCategory]?.label ?? category
}
