import type { Equipment } from '../../../../content/equipment'
import { isEquipmentStackable } from '../../../../content/equipment/stackable'
import { formatMoney } from '../../../../primitives/units'
import type { CharacterBuilderDraftEquipmentPurchase } from '../../draft'
import {
  maxAffordableEquipmentQuantity,
  moneyToCopper,
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

/** Budget- and cap-limited max for starting-gold acquisition (picker / new purchase qty). */
export function resolveEquipmentAcquisitionMaxQuantity(args: {
  equipment: Equipment
  budget?: EquipmentBudgetSummary
  currentQuantity: number
}): number {
  const { equipment, budget, currentQuantity } = args
  const unitCost = moneyToCopper(equipment.cost)
  const hasSpendableBudget = budget !== undefined && wealthToCopper(budget.starting) > 0

  let budgetMax: number
  if (unitCost <= 0) {
    budgetMax = currentQuantity + EQUIPMENT_PURCHASE_QUANTITY_MAX
  } else if (hasSpendableBudget && budget) {
    budgetMax = maxAffordableEquipmentQuantity(equipment, budget, currentQuantity)
  } else {
    budgetMax = EQUIPMENT_PURCHASE_QUANTITY_MAX
  }

  return Math.min(EQUIPMENT_PURCHASE_QUANTITY_MAX, Math.max(budgetMax, 1))
}

export function resolveEquipmentPurchaseQuantityLimits(args: {
  equipment: Equipment
  sourceMode?: CharacterBuilderDraftEquipmentPurchase['sourceMode']
  origin?: CharacterBuilderDraftEquipmentPurchase['origin']
  budget?: EquipmentBudgetSummary
  currentQuantity: number
  isPurchaseRow: boolean
}): EquipmentPurchaseQuantityLimits {
  const { equipment, sourceMode, origin, budget, currentQuantity, isPurchaseRow } = args
  const showCost = sourceMode === 'startingGold'

  if (!isPurchaseRow) {
    return { editable: false, min: 1, max: Math.max(currentQuantity, 1), showCost: false }
  }

  if (origin === 'packageConversion' && !isEquipmentStackable(equipment)) {
    return {
      editable: false,
      min: 1,
      max: Math.max(currentQuantity, 1),
      showCost,
    }
  }

  const editable = isEquipmentStackable(equipment) && sourceMode === 'startingGold'
  const acquisitionMax = resolveEquipmentAcquisitionMaxQuantity({
    equipment,
    budget,
    currentQuantity,
  })

  const max = editable ? acquisitionMax : Math.max(currentQuantity, 1)

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
