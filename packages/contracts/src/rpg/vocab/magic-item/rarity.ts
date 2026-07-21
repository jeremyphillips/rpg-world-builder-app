import { keysFromEntries, vocabEnumFromEntries } from '../enum-schema'

import { getTermSentenceForm } from '../types'
import type { GameTermEntry, VocabularyTerm } from '../types'

// ---------------------------------------------------------------------------
// Magic item rarity — standard DMG tiers.
// ---------------------------------------------------------------------------

export const MAGIC_ITEM_RARITY_TERM = {
  label: 'Magic Item Rarity',
  description: 'A classification of a magic item’s relative power and availability.',
  sentence: {
    singular: 'magic item rarity',
    plural: 'magic item rarities',
  },
} as const satisfies VocabularyTerm

export const MAGIC_ITEM_RARITY_ENTRIES = {
  common: {
    label: 'Common',
    description: 'A minor magic item with limited power.',
    sentence: {
      singular: 'common magic item',
      plural: 'common magic items',
    },
  },
  uncommon: {
    label: 'Uncommon',
    description: 'A useful magic item found with moderate frequency.',
    sentence: {
      singular: 'uncommon magic item',
      plural: 'uncommon magic items',
    },
  },
  rare: {
    label: 'Rare',
    description: 'A powerful magic item that is not encountered often.',
    sentence: {
      singular: 'rare magic item',
      plural: 'rare magic items',
    },
  },
  very_rare: {
    label: 'Very Rare',
    description: 'A potent magic item suitable for high-level play.',
    sentence: {
      singular: 'very rare magic item',
      plural: 'very rare magic items',
    },
  },
  legendary: {
    label: 'Legendary',
    description: 'An exceptionally powerful magic item tied to major stories.',
    sentence: {
      singular: 'legendary magic item',
      plural: 'legendary magic items',
    },
  },
  artifact: {
    label: 'Artifact',
    description: 'A unique item of world-shaping power.',
    sentence: {
      singular: 'artifact',
      plural: 'artifacts',
    },
  },
} as const satisfies Record<string, GameTermEntry>

export type MagicItemRarity = keyof typeof MAGIC_ITEM_RARITY_ENTRIES

export const MAGIC_ITEM_RARITIES = keysFromEntries(MAGIC_ITEM_RARITY_ENTRIES)

export const magicItemRaritySchema = vocabEnumFromEntries(MAGIC_ITEM_RARITY_ENTRIES)

/** Returns the reference entry for a magic item rarity, if known. */
export function getMagicItemRarityEntry(rarity: string): GameTermEntry | undefined {
  return MAGIC_ITEM_RARITY_ENTRIES[rarity as MagicItemRarity]
}

/** Returns the display label for a magic item rarity. Falls back to the raw value. */
export function getMagicItemRarityLabel(rarity: string): string {
  return getMagicItemRarityEntry(rarity)?.label ?? rarity
}

/** Counted noun phrase for generated magic-item rarity pool prose. */
export function getMagicItemRaritySentenceForm(rarity: string, count = 1): string {
  const entry = getMagicItemRarityEntry(rarity)
  if (entry) return getTermSentenceForm(entry, count)
  return getTermSentenceForm({ label: rarity, description: '' }, count)
}
