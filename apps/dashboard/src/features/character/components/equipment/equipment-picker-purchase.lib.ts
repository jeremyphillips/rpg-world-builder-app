import {
  formatMoney,
  formatWealthAsGold,
  moneyToCopper,
  subtractFromWealth,
  type Equipment,
  type EquipmentBudgetSummary,
} from '@rpg/contracts'

import {
  clampEquipmentStepQuantity,
  resolveEquipmentStepPurchaseMaxQuantity,
} from '../../lib/equipment-quantity.lib'

export const EQUIPMENT_PICKER_PURCHASE_SECTION_LABEL = 'Purchase'
export const EQUIPMENT_PICKER_PURCHASE_QUANTITY_LABEL = 'Quantity'
export const EQUIPMENT_PICKER_PURCHASE_UNIT_PRICE_LABEL = 'Unit price'
export const EQUIPMENT_PICKER_PURCHASE_TOTAL_LABEL = 'Total'
export const EQUIPMENT_PICKER_PURCHASE_REMAINING_LABEL = 'Remaining after purchase'
export const EQUIPMENT_PICKER_PURCHASE_COMMIT_LABEL = 'Add to equipment'
export const EQUIPMENT_PICKER_PURCHASE_ALREADY_OWNED_LABEL = 'Already in equipment'
export const EQUIPMENT_PICKER_PURCHASE_ADD_ANOTHER_LABEL = 'Add another'

export type EquipmentPickerPurchaseViewModel = {
  mode: 'new'
  quantity: number
  maxQuantity: number
  unitPriceLabel: string
  totalLabel: string
  remainingAfterLabel: string
  commitLabel: typeof EQUIPMENT_PICKER_PURCHASE_COMMIT_LABEL
}

function formatPurchaseTotal(equipment: Equipment, quantity: number): string {
  return formatMoney({
    amount: equipment.cost.amount * quantity,
    currency: equipment.cost.currency,
  })
}

function formatRemainingAfterPurchase(
  budget: EquipmentBudgetSummary,
  equipment: Equipment,
  quantity: number,
): string {
  const totalCp = moneyToCopper(equipment.cost) * quantity
  return formatWealthAsGold(subtractFromWealth(budget.remaining, totalCp))
}

export function buildEquipmentPickerPurchaseViewModel(args: {
  equipment: Equipment
  quantity: number
  budget?: EquipmentBudgetSummary
  ownedQuantity: number
}): EquipmentPickerPurchaseViewModel | undefined {
  const { equipment, quantity, budget, ownedQuantity } = args

  if (ownedQuantity > 0) return undefined

  const maxQuantity = resolveEquipmentStepPurchaseMaxQuantity({
    equipment,
    budget,
    currentQuantity: ownedQuantity,
  })
  const cappedQuantity = clampEquipmentStepQuantity(quantity, maxQuantity)

  return {
    mode: 'new',
    quantity: cappedQuantity,
    maxQuantity,
    unitPriceLabel: formatMoney(equipment.cost),
    totalLabel: formatPurchaseTotal(equipment, cappedQuantity),
    remainingAfterLabel: budget
      ? formatRemainingAfterPurchase(budget, equipment, cappedQuantity)
      : '—',
    commitLabel: EQUIPMENT_PICKER_PURCHASE_COMMIT_LABEL,
  }
}
