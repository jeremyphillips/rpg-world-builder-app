import type { CharacterWealthGrant } from '../../../../content/lib/grants/wealth-grant'
import { joinInlineMetadata } from '../../../../primitives/inline-metadata'
import { joinNaturalList } from '../../../../primitives/prose'
import { formatWealth } from '../../../../primitives/wealth'
import {
  characterWealthFromGrant,
  type CharacterWealth,
} from '../../../character/sheet/equipment-inventory'
import type { StartingEquipmentOptionSummaryItem } from './resolve-starting-equipment-option-summaries'

/** Compact package stats for authoring previews — item count plus formatted baseline wealth. */
export function formatStartingEquipmentOptionCompactSummary(args: {
  itemCount: number
  wealth?: CharacterWealthGrant
}): string {
  const parts: string[] = []

  if (args.itemCount > 0) {
    parts.push(`${args.itemCount} ${args.itemCount === 1 ? 'item' : 'items'}`)
  }

  if (args.wealth) {
    parts.push(formatWealth(characterWealthFromGrant(args.wealth)))
  }

  return joinInlineMetadata(parts)
}

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
  return `Take ${formatWealth(args.wealth)} instead of ${label}.`
}
