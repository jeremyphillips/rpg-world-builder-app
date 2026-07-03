import { z } from 'zod'

import type { GameTermEntry } from '../types'

// ---------------------------------------------------------------------------
// Armor categories — the closed SRD 5.2.1 category set. Used by class
// proficiencies, species grants, and the full armor content type.
// ---------------------------------------------------------------------------

export const ARMOR_CATEGORIES = ['light', 'medium', 'heavy', 'shields'] as const

export const armorCategorySchema = z.enum(ARMOR_CATEGORIES)

export type ArmorCategory = z.infer<typeof armorCategorySchema>

export const ARMOR_CATEGORY_ENTRIES = {
  light: {
    label: 'Light Armor',
    description: '1 minute to don or doff.',
    sentence: {
      singular: 'suit of light armor',
      plural: 'suits of light armor',
    },
  },
  medium: {
    label: 'Medium Armor',
    description: '5 minutes to don and 1 minute to doff.',
    sentence: {
      singular: 'suit of medium armor',
      plural: 'suits of medium armor',
    },
  },
  heavy: {
    label: 'Heavy Armor',
    description: '10 minutes to don and 5 minutes to doff.',
    sentence: {
      singular: 'suit of heavy armor',
      plural: 'suits of heavy armor',
    },
  },
  shields: {
    label: 'Shield',
    description: 'Utilize action to don or doff.',
  },
} as const satisfies Record<ArmorCategory, GameTermEntry>

/** Returns the reference entry for an armor category, if known. */
export function getArmorCategoryEntry(c: string): GameTermEntry | undefined {
  return ARMOR_CATEGORY_ENTRIES[c as ArmorCategory]
}

/** Returns the display label for an armor category. Falls back to the raw value. */
export function getArmorCategoryLabel(c: string): string {
  return getArmorCategoryEntry(c)?.label ?? c
}
