import {
  getMagicItemRarityLabel,
  type MagicItemAllowanceRequirement,
  type MagicItemRarity,
} from '@rpg/contracts'

const MAGIC_ITEM_CHOICE_SINGULAR = 'choice'
const MAGIC_ITEM_CHOICE_PLURAL = 'choices'
const MAGIC_ITEM_UP_TO_PREFIX = 'Up to'

/**
 * Rarity phrase for an allowance bucket. Two allowances of the same rarity are
 * distinguished by their requirement: an up-to slot reads `Up to Uncommon`.
 */
export function formatMagicItemChoiceRarityPhrase(
  rarity: MagicItemRarity,
  requirement: MagicItemAllowanceRequirement = 'exact',
): string {
  const rarityLabel = getMagicItemRarityLabel(rarity)
  return requirement === 'up_to' ? `${MAGIC_ITEM_UP_TO_PREFIX} ${rarityLabel}` : rarityLabel
}

/** `Common choice` at one, `2 Common choices` above it. */
export function formatMagicItemChoiceLabel(
  quantity: number,
  rarity: MagicItemRarity,
  requirement?: MagicItemAllowanceRequirement,
): string {
  const phrase = formatMagicItemChoiceRarityPhrase(rarity, requirement)
  return quantity === 1
    ? `${phrase} ${MAGIC_ITEM_CHOICE_SINGULAR}`
    : `${quantity} ${phrase} ${MAGIC_ITEM_CHOICE_PLURAL}`
}

/** Plural bucket heading (`Common choices`) from an already-formatted rarity phrase. */
export function formatMagicItemChoiceBucketLabel(phrase: string): string {
  const normalized = phrase.replace(/\s+choices?$/i, '')
  return `${normalized} ${MAGIC_ITEM_CHOICE_PLURAL}`
}

/** Re-pluralizes a stored `<Rarity> choice` source label against a quantity. */
export function formatMagicItemChoiceLabelFromSourceLabel(
  sourceLabel: string,
  quantity: number,
): string {
  const phrase = sourceLabel.replace(/\s+choices?$/i, '')
  return quantity === 1
    ? `${phrase} ${MAGIC_ITEM_CHOICE_SINGULAR}`
    : `${quantity} ${phrase} ${MAGIC_ITEM_CHOICE_PLURAL}`
}
