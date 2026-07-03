import { z } from 'zod'

import { getTermSentenceForm } from '../types'
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
    sentence: {
      singular: 'magic weapon',
      plural: 'magic weapons',
    },
  },
  armor: {
    label: 'Armor',
    description: 'Magic armor or a shield with an enhancement bonus.',
    sentence: {
      singular: 'suit of magic armor',
      plural: 'suits of magic armor',
    },
  },
  wondrous_item: {
    label: 'Wondrous Item',
    description: 'A miscellaneous magic item such as boots, bracers, or an amulet.',
    sentence: {
      singular: 'wondrous item',
      plural: 'wondrous items',
    },
  },
  potion: {
    label: 'Potion',
    description: 'A single-use liquid magic item.',
    sentence: {
      singular: 'potion',
      plural: 'potions',
    },
  },
  ring: {
    label: 'Ring',
    description: 'A magic ring worn on the finger.',
    sentence: {
      singular: 'magic ring',
      plural: 'magic rings',
    },
  },
  rod: {
    label: 'Rod',
    description: 'A scepter-like magic item.',
    sentence: {
      singular: 'magic rod',
      plural: 'magic rods',
    },
  },
  scroll: {
    label: 'Scroll',
    description: 'A spell scroll or similar one-use written magic.',
    sentence: {
      singular: 'spell scroll',
      plural: 'spell scrolls',
    },
  },
  staff: {
    label: 'Staff',
    description: 'A magic staff, often a spell focus with charges or spells.',
    sentence: {
      singular: 'magic staff',
      plural: 'magic staves',
    },
  },
  wand: {
    label: 'Wand',
    description: 'A slender magic item that casts a limited set of spells.',
    sentence: {
      singular: 'magic wand',
      plural: 'magic wands',
    },
  },
  other: {
    label: 'Other',
    description: 'A magic item that does not fit another category.',
  },
} as const satisfies Record<MagicItemCategory, GameTermEntry>

/** Returns the reference entry for a magic item category, if known. */
export function getMagicItemCategoryEntry(category: string): GameTermEntry | undefined {
  return MAGIC_ITEM_CATEGORY_ENTRIES[category as MagicItemCategory]
}

/** Returns the display label for a magic item category. Falls back to the raw value. */
export function getMagicItemCategoryLabel(category: string): string {
  return getMagicItemCategoryEntry(category)?.label ?? category
}

/** Counted noun phrase for generated magic-item pool prose. */
export function getMagicItemCategorySentenceForm(category: string, count = 1): string {
  const entry = getMagicItemCategoryEntry(category)
  if (entry) return getTermSentenceForm(entry, count)
  return getTermSentenceForm({ label: category, description: '' }, count)
}
