import type { Equipment } from '@rpg/contracts'

import type { EquipmentPickerRowActionViewModel } from '../equipment-picker-action.lib'
import { buildEquipmentPickerGrantViewModel } from '../purchase/equipment-picker-grant.lib'
import { buildEquipmentPickerPurchaseViewModel } from '../purchase/equipment-picker-purchase.lib'
import type {
  EquipmentBudgetSummary,
  EquipmentPickerItemState,
} from '../drawer/equipment-picker-drawer.types'

export function resolveEquipmentPickerItemDetailsDisabled(args: {
  rowActionVm?: EquipmentPickerRowActionViewModel
  itemState: EquipmentPickerItemState
}): boolean {
  if (args.rowActionVm?.kind === 'purchase') return args.rowActionVm.disabled
  if (args.rowActionVm?.kind === 'magic_item_grant') return args.rowActionVm.disabled

  return (
    args.itemState.disabledReasons.length > 0 ||
    args.itemState.purchaseAvailability.status === 'unavailable' ||
    args.itemState.purchaseAvailability.status === 'unaffordable'
  )
}

export function buildEquipmentPickerItemDetailsViewModels(args: {
  equipment: Equipment
  rowActionVm?: EquipmentPickerRowActionViewModel
  addQuantity: number
  budget?: EquipmentBudgetSummary
  ownedQuantity: number
}) {
  const purchaseViewModel =
    args.rowActionVm?.kind === 'purchase' || args.rowActionVm === undefined
      ? buildEquipmentPickerPurchaseViewModel({
          equipment: args.equipment,
          quantity: args.addQuantity,
          budget: args.budget,
          ownedQuantity: args.ownedQuantity,
        })
      : undefined

  const grantViewModel =
    args.rowActionVm?.kind === 'magic_item_grant'
      ? buildEquipmentPickerGrantViewModel({
          equipment: args.equipment,
          rowActionVm: args.rowActionVm,
          quantity: args.addQuantity,
        })
      : undefined

  return { purchaseViewModel, grantViewModel }
}
