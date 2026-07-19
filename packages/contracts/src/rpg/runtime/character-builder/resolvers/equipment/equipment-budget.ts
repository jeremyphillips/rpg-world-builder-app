import type { StartingWealthRules } from '../../../../campaign/rules/starting-wealth'
import { resolveStartingWealthTierForBuilder } from '../../../../campaign/rules/starting-wealth'
import type { Equipment } from '../../../../content/equipment'
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
): number | undefined {
  const classId = draft.class.classId
  if (!classId) return undefined

  const characterClass = catalogIndex.classes.get(classId)
  const startingEquipment = characterClass?.characterCreation?.startingEquipment
  const selectedOptionId = readSelectedStartingEquipmentOptionId(draft, classId)
  if (!startingEquipment || !selectedOptionId) return undefined

  const option = startingEquipment.options.find((entry) => entry.id === selectedOptionId)
  if (!option) return undefined

  return wealthToCopper(characterWealthFromGrant(option.wealth))
}

/** Derives starting/spent/remaining wealth from the selected package and draft purchases. */
export function deriveEquipmentBudgetSummary(
  draft: CharacterBuilderDraft,
  catalogIndex: CharacterBuildCatalogIndex,
  options?: DeriveEquipmentBudgetSummaryOptions,
): EquipmentBudgetSummary | undefined {
  const classId = draft.class.classId
  if (!classId) return undefined

  const startingLevel = getBuilderSelectedStartingLevel(draft)
  const tierBonusCp = resolveTierBonusCopper(options?.startingWealth, startingLevel)
  const purchases = draft.equipment?.purchases ?? []
  const packageStartingCp = resolvePackageStartingCopper(draft, catalogIndex)

  if (packageStartingCp === undefined) {
    if (tierBonusCp <= 0) return undefined
    return buildEquipmentBudgetSummary(tierBonusCp, purchases, catalogIndex)
  }

  return buildEquipmentBudgetSummary(packageStartingCp + tierBonusCp, purchases, catalogIndex)
}

export type { CoinWealth }
