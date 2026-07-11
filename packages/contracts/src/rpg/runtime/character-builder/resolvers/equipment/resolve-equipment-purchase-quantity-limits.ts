import type { Equipment } from '../../../../content/equipment'
import { isEquipmentStackable } from '../../../../content/equipment/stackable'
import { formatMoney } from '../../../../primitives/units'
import type { CharacterBuilderDraftEquipmentPurchase } from '../../draft'
import {
  maxAffordableEquipmentQuantity,
  wealthToCopper,
  type EquipmentBudgetSummary,
} from './equipment-budget'

/** Hard cap per purchase row (bundle units). */
export const EQUIPMENT_PURCHASE_QUANTITY_MAX = 99

export type EquipmentPurchaseQuantityLimits = {
  editable: boolean
  min: 1
  max: number
  showCost: boolean
}

export function resolveEquipmentPurchaseQuantityLimits(args: {
  equipment: Equipment
  sourceMode?: CharacterBuilderDraftEquipmentPurchase['sourceMode']
  budget?: EquipmentBudgetSummary
  currentQuantity: number
  isPurchaseRow: boolean
}): EquipmentPurchaseQuantityLimits {
  const { equipment, sourceMode, budget, currentQuantity, isPurchaseRow } = args
  const showCost = sourceMode === 'startingGold'

  if (!isPurchaseRow) {
    return { editable: false, min: 1, max: Math.max(currentQuantity, 1), showCost: false }
  }

  const editable = isEquipmentStackable(equipment) && sourceMode === 'startingGold'
  const hasSpendableBudget = budget !== undefined && wealthToCopper(budget.starting) > 0
  const budgetMax =
    hasSpendableBudget && budget
      ? maxAffordableEquipmentQuantity(equipment, budget, currentQuantity)
      : EQUIPMENT_PURCHASE_QUANTITY_MAX

  const max = editable
    ? Math.min(EQUIPMENT_PURCHASE_QUANTITY_MAX, budgetMax)
    : Math.max(currentQuantity, 1)

  return {
    editable,
    min: 1,
    max,
    showCost,
  }
}

export function formatEquipmentPurchaseUnitPriceLabel(equipment: Equipment): string {
  return `${formatMoney(equipment.cost)} each`
}

export function formatEquipmentPurchaseTotalPriceLabel(
  equipment: Equipment,
  quantity: number,
): string {
  return formatMoney({
    amount: equipment.cost.amount * quantity,
    currency: equipment.cost.currency,
  })
}

/** Muted bundle copy for inventory/picker surfaces (purchase units, not item units). */
export function formatEquipmentBundleLabel(equipment: Equipment): string | undefined {
  if (equipment.kind !== 'adventuring_gear' || equipment.bundleSize === undefined) {
    return undefined
  }

  return `${equipment.bundleSize} ${equipment.name.toLowerCase()} per bundle`
}
