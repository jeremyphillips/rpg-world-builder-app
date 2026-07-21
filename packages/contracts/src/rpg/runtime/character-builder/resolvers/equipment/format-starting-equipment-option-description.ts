import type { CharacterWealthGrant } from '../../../../content/lib/wealth-grant'
import { joinNaturalList } from '../../../../primitives/prose'
import { formatWealth, formatWealthAsGold, wealthToCopper } from '../../../../primitives/wealth'
import {
  characterWealthFromGrant,
  type CharacterWealth,
} from '../../../character/equipment-inventory'
import type { StartingEquipmentOptionSummaryItem } from './resolve-starting-equipment-option-summaries'

export const DEFAULT_STANDARD_EQUIPMENT_LABEL = 'standard equipment'

function formatGrantPhrase(quantity: number, name: string): string {
  if (quantity <= 1) return name
  const plural = name.endsWith('s') ? name : `${name}s`
  return `${quantity} ${plural}`
}

function phraseForItem(item: StartingEquipmentOptionSummaryItem): string | undefined {
  if (item.kind === 'grant') {
    const name = item.equipment?.name ?? item.equipmentSlug
    return formatGrantPhrase(item.quantity, name)
  }

  if (item.kind === 'choice') {
    return `${item.choose}× ${item.poolLabel}`
  }

  if (item.status === 'invalid') return undefined
  if (item.status === 'resolved' && item.resolvedEquipment) {
    return item.resolvedEquipment.name
  }

  return `Selection from "${item.choiceLabel}"`
}

/** Pure prose — iterates items in authored order, not inventory groups. */
export function collectStartingEquipmentOptionPhrases(
  orderedItems: readonly StartingEquipmentOptionSummaryItem[],
): string[] {
  const phrases: string[] = []

  for (const item of orderedItems) {
    const phrase = phraseForItem(item)
    if (phrase) phrases.push(phrase)
  }

  return phrases
}

export function formatStartingEquipmentPackageDescription(args: {
  orderedItems: readonly StartingEquipmentOptionSummaryItem[]
  wealth?: CharacterWealthGrant
}): string {
  const phrases = collectStartingEquipmentOptionPhrases(args.orderedItems)

  if (args.wealth) {
    phrases.push(formatWealth(characterWealthFromGrant(args.wealth)))
  }

  const sentence = joinNaturalList(phrases)
  return sentence ? `${sentence}.` : ''
}

export function formatStartingGoldOptionDescription(args: {
  wealth: CharacterWealth
  standardPackageLabel?: string
}): string {
  const label = args.standardPackageLabel ?? DEFAULT_STANDARD_EQUIPMENT_LABEL
  return `Take ${formatWealthAsGold(args.wealth)} instead of ${label}.`
}

export type StartingEquipmentTierAdjustment = {
  label: string
  additionalWealthLabel: string
}

/** Compact tier-add line for option cards (selection-independent funding metadata). */
export function formatStartingEquipmentTierAdjustment(args: {
  tierLabel?: string
  tierAdditionalWealth: CharacterWealth
}): StartingEquipmentTierAdjustment | undefined {
  if (wealthToCopper(args.tierAdditionalWealth) <= 0) return undefined

  const additionalWealthLabel = formatWealthAsGold(args.tierAdditionalWealth)
  const tierName = args.tierLabel?.trim() || 'Starting-wealth'
  return {
    label: `${tierName} tier adds ${additionalWealthLabel}`,
    additionalWealthLabel,
  }
}

/** Total purchasing allowance line shown under tier adjustment. */
export function formatStartingEquipmentTotalWealthLabel(args: {
  totalStartingWealth: CharacterWealth
  isStartingGoldOption: boolean
}): string | undefined {
  if (wealthToCopper(args.totalStartingWealth) <= 0) return undefined

  const total = formatWealthAsGold(args.totalStartingWealth)
  return args.isStartingGoldOption ? `Total: ${total}` : `Total purchasing gold: ${total}`
}
