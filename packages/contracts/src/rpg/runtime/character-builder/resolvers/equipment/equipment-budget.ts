import type { StartingWealthRules } from '../../../../campaign/rules/starting-wealth'
import {
  copperToWealth,
  formatWealth,
  formatWealthAsGold,
  moneyToCopper,
  subtractFromWealth,
  wealthToCopper,
  type CoinWealth,
} from '../../../../primitives/wealth'
import type { Equipment } from '../../../../content/equipment'
import type { CharacterBuildCatalogIndex } from '../../context'
import type { CharacterBuilderDraft } from '../../draft'
import {
  deriveEquipmentBudgetSummaryFromFunding,
  resolveSelectedStartingEquipmentFunding,
  resolveTierOnlyStartingEquipmentFunding,
} from './resolve-starting-equipment-funding'

export type DeriveEquipmentBudgetSummaryOptions = {
  startingWealth?: StartingWealthRules
}

/** Derived shopping budget for equipment picker affordability. */
export type EquipmentBudgetSummary = {
  starting: CoinWealth
  spent: CoinWealth
  remaining: CoinWealth
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

/** Derives starting/spent/remaining wealth from the selected package and draft purchases. */
export function deriveEquipmentBudgetSummary(
  draft: CharacterBuilderDraft,
  catalogIndex: CharacterBuildCatalogIndex,
  options?: DeriveEquipmentBudgetSummaryOptions,
): EquipmentBudgetSummary | undefined {
  if (!draft.class.classId) return undefined

  const purchases = draft.equipment?.purchases ?? []
  const funding =
    resolveSelectedStartingEquipmentFunding({
      draft,
      catalogIndex,
      startingWealth: options?.startingWealth,
    }) ??
    resolveTierOnlyStartingEquipmentFunding({
      draft,
      startingWealth: options?.startingWealth,
    })

  if (!funding) return undefined

  return deriveEquipmentBudgetSummaryFromFunding({
    funding,
    purchases,
    catalogIndex,
  })
}

export type { CoinWealth }
