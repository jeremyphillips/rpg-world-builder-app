import {
  formatEquipmentPurchaseTotalPriceLabel,
  formatMoney,
  type Equipment,
  type EquipmentAcquisitionPlan,
} from '@rpg/contracts'

import { clampEquipmentStepQuantity } from '../../lib/equipment-quantity.lib'
import {
  EQUIPMENT_PICKER_GRANT_COMMIT_LABEL,
  formatPartialActionLabel,
  type EquipmentPickerRowActionViewModel,
} from './equipment-picker-action.lib'

export function formatGrantAllocationBreakdown(args: {
  grantQuantity: number
  purchaseQuantity: number
}): string | undefined {
  const parts: string[] = []

  if (args.grantQuantity > 0) {
    parts.push(`${args.grantQuantity} grant`)
  }

  if (args.purchaseQuantity > 0) {
    parts.push(`${args.purchaseQuantity} purchase`)
  }

  if (parts.length === 0) return undefined
  return parts.join(' + ')
}

export type EquipmentPickerGrantViewModel = {
  quantity: number
  maxQuantity: number
  requestedLabel: string
  breakdownLabel?: string
  availableLabel?: string
  secondaryPriceLabel?: string
  addBlockedNote?: string
  partialActionLabel?: string
  commitLabel: string
  commitDisabled: boolean
  showPartialCommit: boolean
  showFullCommit: boolean
}

export type EquipmentPickerGrantManageSource = {
  grants: ReadonlyArray<{ allowanceId: string; quantity: number }>
  purchases: ReadonlyArray<{ purchaseId: string; quantity: number }>
}

export function formatGrantSecondaryPrice(
  equipment: Equipment,
  plan: EquipmentAcquisitionPlan,
): string | undefined {
  if (plan.purchaseQuantity <= 0) return undefined
  const total = formatEquipmentPurchaseTotalPriceLabel(equipment, plan.purchaseQuantity)
  if (!total) return undefined
  return `${formatMoney(equipment.cost!)} each · ${total} total`
}

function resolvePlanAllocation(plan: EquipmentAcquisitionPlan) {
  if (plan.partialAction) {
    return {
      grantQuantity: plan.partialAction.grantQuantity,
      purchaseQuantity: plan.partialAction.purchaseQuantity,
      fulfillableQuantity: plan.partialAction.requestedQuantity,
    }
  }

  return {
    grantQuantity: plan.grantAllocations.reduce((sum, row) => sum + row.quantity, 0),
    purchaseQuantity: plan.purchaseQuantity,
    fulfillableQuantity: plan.fulfilledQuantity,
  }
}

export function buildEquipmentPickerGrantViewModel(args: {
  equipment: Equipment
  rowActionVm: Extract<EquipmentPickerRowActionViewModel, { kind: 'magic_item_grant' }>
  quantity: number
}): EquipmentPickerGrantViewModel {
  const { equipment, rowActionVm, quantity } = args
  const { plan, capabilities, maxAdditionalQuantity, addBlockedNote } = rowActionVm
  const allocation = resolvePlanAllocation(plan)

  const maxQuantity = Math.max(1, maxAdditionalQuantity)
  const cappedQuantity = clampEquipmentStepQuantity(quantity, maxQuantity)
  const breakdownLabel = formatGrantAllocationBreakdown(allocation)
  const partialActionLabel = plan.partialAction
    ? formatPartialActionLabel(plan.partialAction)
    : undefined

  return {
    quantity: cappedQuantity,
    maxQuantity,
    requestedLabel: `Requested ${cappedQuantity}`,
    breakdownLabel,
    availableLabel:
      plan.partialAction !== undefined ? `${allocation.fulfillableQuantity} available` : undefined,
    secondaryPriceLabel: formatGrantSecondaryPrice(equipment, plan),
    addBlockedNote,
    partialActionLabel,
    commitLabel: partialActionLabel ?? EQUIPMENT_PICKER_GRANT_COMMIT_LABEL,
    commitDisabled: !capabilities.canAdd && plan.partialAction === undefined,
    showPartialCommit: plan.partialAction !== undefined,
    showFullCommit: plan.canApplyRequestedQuantity && plan.partialAction === undefined,
  }
}
