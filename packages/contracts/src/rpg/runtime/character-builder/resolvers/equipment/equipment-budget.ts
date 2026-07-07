import { moneyToCp } from '../../../../primitives/units'
import type { Equipment } from '../../../../content/equipment'
import type { CharacterWealth } from '../../../character/equipment-inventory'

/** Derived shopping budget for equipment picker affordability (BENCH-094 extends derivation). */
export type EquipmentBudgetSummary = {
  starting: CharacterWealth
  spent: CharacterWealth
  remaining: CharacterWealth
}

/** Normalizes multi-denomination wealth to copper pieces for comparisons. */
export function wealthToCopper(wealth: CharacterWealth): number {
  return wealth.cp + wealth.sp * 10 + wealth.gp * 100 + wealth.pp * 1000
}

/** Returns true when the item cost fits in the remaining budget. */
export function isEquipmentAffordable(
  equipment: Equipment,
  budget: EquipmentBudgetSummary,
): boolean {
  return moneyToCp(equipment.cost) <= wealthToCopper(budget.remaining)
}
