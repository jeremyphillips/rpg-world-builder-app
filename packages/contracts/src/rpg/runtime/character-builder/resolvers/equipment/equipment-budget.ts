import type { Equipment } from '../../../../content/equipment'
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
import { readSelectedStartingEquipmentOptionId } from './resolve-starting-equipment-choice-sets'

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

/** Derives starting/spent/remaining wealth from the selected package and draft purchases. */
export function deriveEquipmentBudgetSummary(
  draft: CharacterBuilderDraft,
  catalogIndex: CharacterBuildCatalogIndex,
): EquipmentBudgetSummary | undefined {
  const classId = draft.class.classId
  if (!classId) return undefined

  const characterClass = catalogIndex.classes.get(classId)
  const startingEquipment = characterClass?.characterCreation?.startingEquipment
  if (!startingEquipment) return undefined

  const selectedOptionId = readSelectedStartingEquipmentOptionId(draft, classId)
  if (!selectedOptionId) return undefined

  const option = startingEquipment.options.find((entry) => entry.id === selectedOptionId)
  if (!option) return undefined

  const starting = characterWealthFromGrant(option.wealth)
  const spentCp = sumPurchaseCostCp(draft.equipment?.purchases ?? [], catalogIndex)
  const spent = copperToWealth(spentCp)
  const remaining = subtractFromWealth(starting, spentCp)

  return { starting, spent, remaining }
}

export type { CoinWealth }
