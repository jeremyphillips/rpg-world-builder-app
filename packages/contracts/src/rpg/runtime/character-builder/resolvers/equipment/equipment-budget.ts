import { moneyToCp, type Money } from '../../../../primitives/units'
import type { Equipment } from '../../../../content/equipment'
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

const COPPER_PER_SILVER = 10
const COPPER_PER_GOLD = 100
const COPPER_PER_PLATINUM = 1000

/** Normalizes multi-denomination wealth to copper pieces for comparisons. */
export function wealthToCopper(wealth: CharacterWealth): number {
  return (
    wealth.cp +
    wealth.sp * COPPER_PER_SILVER +
    wealth.gp * COPPER_PER_GOLD +
    wealth.pp * COPPER_PER_PLATINUM
  )
}

/** Normalizes a catalog price to copper pieces. */
export function moneyToCopper(money: Money): number {
  return moneyToCp(money)
}

/** Converts a copper total back into the stored character wealth shape. */
export function copperToWealth(totalCopper: number): CharacterWealth {
  let cp = Math.max(0, Math.floor(totalCopper))
  const pp = Math.floor(cp / COPPER_PER_PLATINUM)
  cp %= COPPER_PER_PLATINUM
  const gp = Math.floor(cp / COPPER_PER_GOLD)
  cp %= COPPER_PER_GOLD
  const sp = Math.floor(cp / COPPER_PER_SILVER)
  cp %= COPPER_PER_SILVER
  return { cp, sp, gp, pp }
}

/** Subtracts a price (or copper total) from wealth, flooring at zero. */
export function subtractFromWealth(
  wealth: CharacterWealth,
  amount: Money | number,
): CharacterWealth {
  const costCp = typeof amount === 'number' ? amount : moneyToCopper(amount)
  return copperToWealth(wealthToCopper(wealth) - costCp)
}

/** Formats multi-denomination wealth for compact UI display. */
export function formatWealth(wealth: CharacterWealth): string {
  const parts: string[] = []
  if (wealth.pp > 0) parts.push(`${wealth.pp} PP`)
  if (wealth.gp > 0) parts.push(`${wealth.gp} GP`)
  if (wealth.sp > 0) parts.push(`${wealth.sp} SP`)
  if (wealth.cp > 0) parts.push(`${wealth.cp} CP`)
  return parts.length > 0 ? parts.join(', ') : '0 GP'
}

/** Returns true when the item cost fits in the remaining budget. */
export function isEquipmentAffordable(
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
