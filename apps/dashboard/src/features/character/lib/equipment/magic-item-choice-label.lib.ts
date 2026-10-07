import {
  capitalizeFirst,
  getMagicItemRarityLabel,
  getMagicItemRarityProseLabel,
  MAGIC_ITEM_RARITIES,
  type MagicItemAllowanceRequirement,
  type MagicItemRarity,
} from '@rpg/contracts'
import { joinNaturalList } from '@rpg/contracts/primitives'

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

type MagicItemChoiceFill = {
  rarity: MagicItemRarity
  isFilled: boolean
  remainingCapacity: number
}

/** Disabled action when this rarity cannot be spent (`No very rare choices`). */
export function formatNoMagicItemChoicesLabel(rarity: MagicItemRarity): string {
  return `No ${getMagicItemRarityProseLabel(rarity)} ${MAGIC_ITEM_CHOICE_PLURAL}`
}

/**
 * Filled rarities that could have covered `itemRarity`.
 * A higher slot can be spent on a lower rarity, so the list runs from the
 * item upward through every filled allowance.
 */
export function listExhaustedMagicItemChoiceRarities(args: {
  itemRarity: MagicItemRarity
  progress: readonly MagicItemChoiceFill[]
}): MagicItemRarity[] {
  const start = MAGIC_ITEM_RARITIES.indexOf(args.itemRarity)

  return MAGIC_ITEM_RARITIES.filter((rarity, index) => {
    if (index < start) return false
    const rows = args.progress.filter((entry) => entry.rarity === rarity)
    if (rows.length === 0) return false
    return rows.every((entry) => entry.isFilled || entry.remainingCapacity <= 0)
  })
}

/** `Common choices are already used.` / `Common and uncommon choices are already used.` */
export function formatMagicItemChoicesAlreadyUsed(rarities: readonly MagicItemRarity[]): string {
  const phrase = capitalizeFirst(
    joinNaturalList(rarities.map((rarity) => getMagicItemRarityProseLabel(rarity))),
  )
  return `${phrase} ${MAGIC_ITEM_CHOICE_PLURAL} are already used.`
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
