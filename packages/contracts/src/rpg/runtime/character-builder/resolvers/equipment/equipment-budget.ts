import type { StartingWealthRules } from '../../../../campaign/rules/starting-wealth'
import { resolveStartingWealthTierForBuilder } from '../../../../campaign/rules/starting-wealth'
import type { CharacterClass } from '../../../../content/classes/class'
import type { Equipment } from '../../../../content/equipment'
import { isWealthOnlyStartingEquipmentOption } from '../../../../content/starting-equipment'
import { averageTierBonusGold } from '../../../../primitives/currency-formula'
import {
  copperToWealth,
  formatWealth,
  formatWealthAsGold,
  moneyToCopper,
  subtractFromWealth,
  wealthToCopper,
  type CoinWealth,
} from '../../../../primitives/wealth'
import {
  characterWealthFromGrant,
  type CharacterWealth,
} from '../../../character/equipment-inventory'
import type { CharacterBuildCatalogIndex } from '../../context'
import type { CharacterBuilderDraft, CharacterBuilderDraftEquipmentPurchase } from '../../draft'
import { getBuilderSelectedStartingLevel } from '../../builder-level'
import { readSelectedStartingEquipmentOptionId } from './resolve-starting-equipment-choice-sets'

export type DeriveEquipmentBudgetSummaryOptions = {
  startingWealth?: StartingWealthRules
  resolvedGoldOptionWealthByOptionId?: ReadonlyMap<string, CharacterWealth>
}

function resolveTierBonusCopper(
  startingWealth: StartingWealthRules | undefined,
  startingLevel: number,
): number {
  if (!startingWealth) return 0

  const tier = resolveStartingWealthTierForBuilder(startingWealth, startingLevel)
  if (!tier?.bonusGold) return 0

  const bonusGp = Math.floor(averageTierBonusGold(tier.bonusGold))
  return bonusGp * 100
}

/** Derived shopping budget for equipment picker affordability. */
export type EquipmentBudgetSummary = {
  starting: CharacterWealth
  spent: CharacterWealth
  remaining: CharacterWealth
}

export {
  copperToWealth,
  formatWealth,
  formatWealthAsGold,
  moneyToCopper,
  subtractFromWealth,
  wealthToCopper,
}

/** Returns true when the item cost fits in the starting (package) budget. */
export function isEquipmentAffordableAtStartingBudget(
  equipment: Equipment,
  budget: EquipmentBudgetSummary,
): boolean {
  return moneyToCopper(equipment.cost) <= wealthToCopper(budget.starting)
}

/** Returns true when the item cost fits in the remaining budget after purchases. */
export function isEquipmentWithinRemainingBudget(
  equipment: Equipment,
  budget: EquipmentBudgetSummary,
): boolean {
  return moneyToCopper(equipment.cost) <= wealthToCopper(budget.remaining)
}

/** Maximum quantity affordable from the current remaining budget. */
export function maxAffordableEquipmentQuantity(
  equipment: Equipment,
  budget: EquipmentBudgetSummary,
  currentQuantity = 0,
): number {
  const unitCost = moneyToCopper(equipment.cost)
  if (unitCost <= 0) return Math.max(currentQuantity, 1)

  const additional = Math.floor(wealthToCopper(budget.remaining) / unitCost)
  return currentQuantity + additional
}

function sumPurchaseCostCp(
  purchases: readonly CharacterBuilderDraftEquipmentPurchase[],
  catalogIndex: CharacterBuildCatalogIndex,
): number {
  if (!purchases) return 0

  return purchases.reduce((total, purchase) => {
    const equipment = catalogIndex.equipment.get(purchase.equipmentId)
    if (!equipment) return total
    return total + moneyToCopper(equipment.cost) * purchase.quantity
  }, 0)
}

function buildEquipmentBudgetSummary(
  startingCp: number,
  purchases: readonly CharacterBuilderDraftEquipmentPurchase[],
  catalogIndex: CharacterBuildCatalogIndex,
): EquipmentBudgetSummary {
  const starting = copperToWealth(startingCp)
  const spentCp = sumPurchaseCostCp(purchases, catalogIndex)
  const spent = copperToWealth(spentCp)
  const remaining = subtractFromWealth(starting, spentCp)
  return { starting, spent, remaining }
}

function resolvePackageStartingCopper(
  draft: CharacterBuilderDraft,
  catalogIndex: CharacterBuildCatalogIndex,
  resolvedGoldOptionWealthByOptionId?: ReadonlyMap<string, CharacterWealth>,
): number | undefined {
  const classId = draft.class.classId
  if (!classId) return undefined

  const characterClass = catalogIndex.classes.get(classId)
  const startingEquipment = characterClass?.characterCreation?.startingEquipment
  const selectedOptionId = readSelectedStartingEquipmentOptionId(draft, classId)
  if (!startingEquipment || !selectedOptionId) return undefined

  const option = startingEquipment.options.find((entry) => entry.id === selectedOptionId)
  if (!option) return undefined

  if (
    isWealthOnlyStartingEquipmentOption(option) &&
    resolvedGoldOptionWealthByOptionId?.has(selectedOptionId)
  ) {
    return wealthToCopper(resolvedGoldOptionWealthByOptionId.get(selectedOptionId)!)
  }

  return wealthToCopper(characterWealthFromGrant(option.wealth))
}

/** Tier-aware starting wealth for each wealth-only starting-equipment option. */
export function resolveStartingGoldOptionWealthByOptionId(
  characterClass: CharacterClass,
  draft: CharacterBuilderDraft,
  options?: { startingWealth?: StartingWealthRules },
): ReadonlyMap<string, CharacterWealth> {
  const startingEquipment = characterClass.characterCreation?.startingEquipment
  if (!startingEquipment) return new Map()

  const startingLevel = getBuilderSelectedStartingLevel(draft)
  const tierBonusCp = resolveTierBonusCopper(options?.startingWealth, startingLevel)
  const result = new Map<string, CharacterWealth>()

  for (const option of startingEquipment.options) {
    if (!isWealthOnlyStartingEquipmentOption(option)) continue

    const baseCp = wealthToCopper(characterWealthFromGrant(option.wealth!))
    result.set(option.id, copperToWealth(baseCp + tierBonusCp))
  }

  return result
}

function isPreResolvedGoldSelection(
  draft: CharacterBuilderDraft,
  catalogIndex: CharacterBuildCatalogIndex,
  resolvedGoldOptionWealthByOptionId?: ReadonlyMap<string, CharacterWealth>,
): boolean {
  const classId = draft.class.classId
  if (!classId) return false

  const selectedOptionId = readSelectedStartingEquipmentOptionId(draft, classId)
  if (!selectedOptionId || !resolvedGoldOptionWealthByOptionId?.has(selectedOptionId)) {
    return false
  }

  const characterClass = catalogIndex.classes.get(classId)
  const selectedOption = characterClass?.characterCreation?.startingEquipment?.options.find(
    (entry) => entry.id === selectedOptionId,
  )

  return selectedOption !== undefined && isWealthOnlyStartingEquipmentOption(selectedOption)
}

function resolveBudgetStartingCopper(
  draft: CharacterBuilderDraft,
  catalogIndex: CharacterBuildCatalogIndex,
  tierBonusCp: number,
  options?: DeriveEquipmentBudgetSummaryOptions,
): number | undefined {
  const packageStartingCp = resolvePackageStartingCopper(
    draft,
    catalogIndex,
    options?.resolvedGoldOptionWealthByOptionId,
  )

  if (packageStartingCp === undefined) {
    return tierBonusCp > 0 ? tierBonusCp : undefined
  }

  if (
    isPreResolvedGoldSelection(draft, catalogIndex, options?.resolvedGoldOptionWealthByOptionId)
  ) {
    return packageStartingCp
  }

  return packageStartingCp + tierBonusCp
}

/** Derives starting/spent/remaining wealth from the selected package and draft purchases. */
export function deriveEquipmentBudgetSummary(
  draft: CharacterBuilderDraft,
  catalogIndex: CharacterBuildCatalogIndex,
  options?: DeriveEquipmentBudgetSummaryOptions,
): EquipmentBudgetSummary | undefined {
  if (!draft.class.classId) return undefined

  const startingLevel = getBuilderSelectedStartingLevel(draft)
  const tierBonusCp = resolveTierBonusCopper(options?.startingWealth, startingLevel)
  const purchases = draft.equipment?.purchases ?? []
  const startingCp = resolveBudgetStartingCopper(draft, catalogIndex, tierBonusCp, options)

  if (startingCp === undefined) return undefined

  return buildEquipmentBudgetSummary(startingCp, purchases, catalogIndex)
}

export type { CoinWealth }
