import {
  canPurchaseEquipment,
  formatEquipmentPurchaseTotalPriceLabel,
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
} from '../../lib/equipment/equipment-quantity.lib'

export const EQUIPMENT_PICKER_PURCHASE_SECTION_LABEL = 'Add to inventory'
export const EQUIPMENT_PICKER_PURCHASE_QUANTITY_LABEL = 'Quantity to add'
export const EQUIPMENT_PICKER_PURCHASE_UNIT_PRICE_LABEL = 'Unit price'
export const EQUIPMENT_PICKER_PURCHASE_TOTAL_LABEL = 'Total'
export const EQUIPMENT_PICKER_PURCHASE_REMAINING_LABEL = 'Remaining after purchase'
export const EQUIPMENT_PICKER_PURCHASE_COMMIT_LABEL = 'Add to inventory'
export const EQUIPMENT_PICKER_PURCHASE_INVENTORY_LABEL = 'Currently owned'
export const EQUIPMENT_PICKER_PURCHASE_REMOVE_ONE_LABEL = 'Remove one from inventory'
export const EQUIPMENT_PICKER_PURCHASE_REMOVE_ALL_LABEL = 'Remove from inventory'
export const EQUIPMENT_PICKER_PURCHASE_ADD_ANOTHER_LABEL = 'Add another'

export type EquipmentPickerPurchasePricingViewModel = {
  quantity: number
  maxQuantity: number
  unitPriceLabel: string
  totalLabel: string
  remainingAfterLabel: string
}

export type EquipmentPickerPurchaseViewModel =
  | ({
      mode: 'new'
      commitLabel: typeof EQUIPMENT_PICKER_PURCHASE_COMMIT_LABEL
    } & EquipmentPickerPurchasePricingViewModel)
  | ({
      mode: 'owned'
      ownedQuantity: number
      commitLabel: typeof EQUIPMENT_PICKER_PURCHASE_ADD_ANOTHER_LABEL
    } & EquipmentPickerPurchasePricingViewModel)

function formatRemainingAfterPurchase(
  budget: EquipmentBudgetSummary,
  equipment: Equipment,
  quantity: number,
): string {
  if (!canPurchaseEquipment(equipment)) return '—'
  const totalCp = moneyToCopper(equipment.cost) * quantity
  return formatWealthAsGold(subtractFromWealth(budget.remaining, totalCp))
}

function buildEquipmentPickerPurchasePricingViewModel(args: {
  equipment: Equipment
  quantity: number
  budget?: EquipmentBudgetSummary
}): Pick<
  EquipmentPickerPurchasePricingViewModel,
  'unitPriceLabel' | 'totalLabel' | 'remainingAfterLabel'
> {
  const { equipment, quantity, budget } = args

  return {
    unitPriceLabel: canPurchaseEquipment(equipment) ? formatMoney(equipment.cost) : '',
    totalLabel: formatEquipmentPurchaseTotalPriceLabel(equipment, quantity),
    remainingAfterLabel: budget ? formatRemainingAfterPurchase(budget, equipment, quantity) : '—',
  }
}

export function buildEquipmentPickerPurchaseViewModel(args: {
  equipment: Equipment
  quantity: number
  budget?: EquipmentBudgetSummary
  ownedQuantity: number
}): EquipmentPickerPurchaseViewModel | undefined {
  const { equipment, quantity, budget, ownedQuantity } = args

  const maxQuantity = resolveEquipmentStepPurchaseMaxQuantity({
    equipment,
    budget,
    currentQuantity: ownedQuantity,
  })
  const cappedQuantity = clampEquipmentStepQuantity(quantity, maxQuantity)
  const pricing = buildEquipmentPickerPurchasePricingViewModel({
    equipment,
    quantity: cappedQuantity,
    budget,
  })

  if (ownedQuantity > 0) {
    return {
      mode: 'owned',
      ownedQuantity,
      quantity: cappedQuantity,
      maxQuantity,
      ...pricing,
      commitLabel: EQUIPMENT_PICKER_PURCHASE_ADD_ANOTHER_LABEL,
    }
  }

  return {
    mode: 'new',
    quantity: cappedQuantity,
    maxQuantity,
    ...pricing,
    commitLabel: EQUIPMENT_PICKER_PURCHASE_COMMIT_LABEL,
  }
}
