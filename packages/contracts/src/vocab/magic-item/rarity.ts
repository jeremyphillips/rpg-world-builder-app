import { z } from 'zod'

import type { GameTermEntry } from '../types'

// ---------------------------------------------------------------------------
// Magic item rarity — standard DMG tiers.
// ---------------------------------------------------------------------------

export const MAGIC_ITEM_RARITIES = [
  'common',
  'uncommon',
  'rare',
  'very_rare',
  'legendary',
  'artifact',
] as const

export const magicItemRaritySchema = z.enum(MAGIC_ITEM_RARITIES)

export type MagicItemRarity = z.infer<typeof magicItemRaritySchema>

export const MAGIC_ITEM_RARITY_ENTRIES = {
  common: {
    label: 'Common',
    description: 'A minor magic item with limited power.',
  },
  uncommon: {
    label: 'Uncommon',
    description: 'A useful magic item found with moderate frequency.',
  },
  rare: {
    label: 'Rare',
    description: 'A powerful magic item that is not encountered often.',
  },
  very_rare: {
    label: 'Very Rare',
    description: 'A potent magic item suitable for high-level play.',
  },
  legendary: {
    label: 'Legendary',
    description: 'An exceptionally powerful magic item tied to major stories.',
  },
  artifact: {
    label: 'Artifact',
    description: 'A unique item of world-shaping power.',
  },
} as const satisfies Record<MagicItemRarity, GameTermEntry>

/** Returns the display label for a magic item rarity. Falls back to the raw value. */
export function getMagicItemRarityLabel(rarity: string): string {
  return MAGIC_ITEM_RARITY_ENTRIES[rarity as MagicItemRarity]?.label ?? rarity
}
