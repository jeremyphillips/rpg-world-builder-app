import {
  averageTierBonusGold,
  computeStartingWealthSparsePatch,
  CURRENCY_IDS,
  formatTierBonusGold,
  type Currency,
  type CurrencyDiceFormula,
  type DieFace,
  type MagicItemRarity,
  type StartingWealthRules,
  type StartingWealthRulesPatch,
  type StartingWealthTier,
  type TierBonusGold,
} from '@rpg/contracts'
import { getStandardStartingWealthRules } from '@rpg/catalog/starting-wealth'
import type { DiceFormulaValue } from '@rpg/ui'

export const STARTING_WEALTH_FORM_PREFIX = 'startingWealth' as const

export const STARTING_WEALTH_TIER_COUNT =
  getStandardStartingWealthRules('srd-cc-5.2.1').tiers.length

export type StartingWealthMagicItemGrantFormValues = {
  rarity: MagicItemRarity
  quantity: number
}

export type StartingWealthTierBonusGoldFormValues = {
  baseGp: number
  formula: DiceFormulaValue
  currency: Currency
}

export type StartingWealthTierFormValues = {
  label: string
  minLevel: number
  maxLevel: number
  includeNormalStartingEquipment: boolean
  bonusGoldEnabled: boolean
  bonusGold: StartingWealthTierBonusGoldFormValues
  magicItemGrants: StartingWealthMagicItemGrantFormValues[]
}

export type StartingWealthFormValues = {
  name: string
  description?: string
  tiers: StartingWealthTierFormValues[]
}

export const STARTING_WEALTH_CURRENCY_OPTIONS = CURRENCY_IDS.map((id) => ({
  value: id,
  label: id.toUpperCase(),
}))

const DEFAULT_BONUS_GOLD_FORMULA: DiceFormulaValue = {
  count: 1,
  faces: 10,
  modifier: { operator: '×', amount: 25 },
}

export function defaultStartingWealthTierBonusGoldFormValues(): StartingWealthTierBonusGoldFormValues {
  return {
    baseGp: 0,
    formula: { ...DEFAULT_BONUS_GOLD_FORMULA },
    currency: 'gp',
  }
}

export function mapBonusGoldFormulaToDiceValue(formula: CurrencyDiceFormula): DiceFormulaValue {
  return {
    count: formula.dice.count,
    faces: formula.dice.faces as DiceFormulaValue['faces'],
    modifier: { operator: '×', amount: formula.multiplier },
  }
}

export function mapDiceValueToBonusGoldFormula(
  dice: DiceFormulaValue,
  currency: Currency,
): CurrencyDiceFormula {
  const multiplier = dice.modifier?.amount ?? 1
  return {
    kind: 'dice',
    dice: { count: dice.count, faces: dice.faces as DieFace },
    multiplier,
    currency,
  }
}

export function mapStartingWealthTierToFormValues(
  tier: StartingWealthTier,
): StartingWealthTierFormValues {
  return {
    label: tier.label,
    minLevel: tier.minLevel,
    maxLevel: tier.maxLevel,
    includeNormalStartingEquipment: tier.includeNormalStartingEquipment,
    bonusGoldEnabled: tier.bonusGold !== null && tier.bonusGold !== undefined,
    bonusGold:
      tier.bonusGold !== null && tier.bonusGold !== undefined
        ? {
            baseGp: tier.bonusGold.baseGp,
            formula: mapBonusGoldFormulaToDiceValue(tier.bonusGold.formula),
            currency: tier.bonusGold.formula.currency,
          }
        : defaultStartingWealthTierBonusGoldFormValues(),
    magicItemGrants: tier.magicItemGrants.map((grant) => ({
      rarity: grant.rarity,
      quantity: grant.quantity,
    })),
  }
}

export function mapStartingWealthToFormValues(
  resolved: StartingWealthRules,
): StartingWealthFormValues {
  return {
    name: resolved.name,
    description: resolved.description,
    tiers: resolved.tiers.map(mapStartingWealthTierToFormValues),
  }
}

function mapTierFormValuesToContract(
  tier: StartingWealthTierFormValues,
  seedTier: StartingWealthTier,
): StartingWealthTier {
  let bonusGold: TierBonusGold | null = null

  if (tier.bonusGoldEnabled) {
    bonusGold = {
      baseGp: tier.bonusGold.baseGp,
      formula: mapDiceValueToBonusGoldFormula(tier.bonusGold.formula, tier.bonusGold.currency),
    }
  }

  return {
    id: seedTier.id,
    label: tier.label,
    minLevel: tier.minLevel,
    maxLevel: tier.maxLevel,
    includeNormalStartingEquipment: tier.includeNormalStartingEquipment,
    bonusGold,
    magicItemGrants: tier.magicItemGrants.map((grant) => ({
      rarity: grant.rarity,
      quantity: grant.quantity,
    })),
  }
}

export function mapStartingWealthFormValuesToRules(
  form: StartingWealthFormValues,
  seed: StartingWealthRules,
): StartingWealthRules {
  return {
    name: form.name,
    description: form.description,
    scope: { kind: 'standard' },
    tiers: form.tiers.map((tier, index) => mapTierFormValuesToContract(tier, seed.tiers[index]!)),
  }
}

/** Emits a sparse rules patch when form values differ from the catalog seed. */
export function buildStartingWealthPatchInput(
  form: StartingWealthFormValues,
  seed: StartingWealthRules,
): StartingWealthRulesPatch | undefined {
  const resolved = mapStartingWealthFormValuesToRules(form, seed)
  return computeStartingWealthSparsePatch(resolved, seed)
}

export function formatStartingWealthTierSummary(tier: StartingWealthTierFormValues): string {
  const parts: string[] = []

  if (tier.bonusGoldEnabled) {
    const bonus: TierBonusGold = {
      baseGp: tier.bonusGold.baseGp,
      formula: mapDiceValueToBonusGoldFormula(tier.bonusGold.formula, tier.bonusGold.currency),
    }
    parts.push(
      `${formatTierBonusGold(bonus)} (avg ${averageTierBonusGold(bonus).toLocaleString()} GP)`,
    )
  }

  if (tier.magicItemGrants.length > 0) {
    const grantSummary = tier.magicItemGrants
      .map((grant) => `${grant.quantity} ${grant.rarity}`)
      .join(', ')
    parts.push(
      `${tier.magicItemGrants.length} magic item grant${tier.magicItemGrants.length === 1 ? '' : 's'} (${grantSummary})`,
    )
  }

  if (parts.length === 0) {
    return tier.includeNormalStartingEquipment
      ? 'Class starting equipment only'
      : 'No bonus gold or magic items'
  }

  return parts.join(' · ')
}
