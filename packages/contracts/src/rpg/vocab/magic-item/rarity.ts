import { keysFromEntries, vocabEnumFromEntries } from '../enum-schema'

import { getTermSentenceForm, titleCaseLabel } from '../types'
import type { GameTermEntry, VocabularyTerm } from '../types'

/** Title-case label plus a curated sentence-case rarity name for prose. */
type MagicItemRarityEntry = GameTermEntry & {
  readonly proseLabel: string
}

function magicItemRarityEntry(
  proseLabel: string,
  description: string,
  sentence?: GameTermEntry['sentence'],
): MagicItemRarityEntry {
  return {
    label: titleCaseLabel(proseLabel),
    description,
    proseLabel,
    sentence: sentence ?? {
      singular: `${proseLabel} magic item`,
      plural: `${proseLabel} magic items`,
    },
  }
}

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
  common: magicItemRarityEntry('common', 'A minor magic item with limited power.'),
  uncommon: magicItemRarityEntry('uncommon', 'A useful magic item found with moderate frequency.'),
  rare: magicItemRarityEntry('rare', 'A powerful magic item that is not encountered often.'),
  very_rare: magicItemRarityEntry('very rare', 'A potent magic item suitable for high-level play.'),
  legendary: magicItemRarityEntry(
    'legendary',
    'An exceptionally powerful magic item tied to major stories.',
  ),
  artifact: magicItemRarityEntry('artifact', 'A unique item of world-shaping power.', {
    singular: 'artifact',
    plural: 'artifacts',
  }),
} as const satisfies Record<string, MagicItemRarityEntry>

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

/** Sentence-case rarity name for prose (`common`, `very rare`). */
export function getMagicItemRarityProseLabel(rarity: MagicItemRarity): string {
  return MAGIC_ITEM_RARITY_ENTRIES[rarity].proseLabel
}

/** Counted noun phrase for generated magic-item rarity pool prose. */
export function getMagicItemRaritySentenceForm(rarity: string, count = 1): string {
  const entry = getMagicItemRarityEntry(rarity)
  if (entry) return getTermSentenceForm(entry, count)
  return getTermSentenceForm({ label: rarity, description: '' }, count)
}
