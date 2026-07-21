import {
  type EquipmentAcquisitionActionState,
  type EquipmentAcquisitionPlan,
  type EquipmentBudgetSummary,
  type EquipmentPurchaseAvailability,
} from '@rpg/contracts'

import {
  EQUIPMENT_PICKER_CANNOT_AFFORD_LABEL,
  EQUIPMENT_PICKER_NOT_PURCHASABLE_LABEL,
} from './equipment-picker-drawer.types'
import { formatEquipmentUnaffordableReason } from './equipment-picker-drawer.lib'
import type { EquipmentPickerItem } from './equipment-picker-drawer.types'

export type EquipmentPickerRowActionViewModel =
  | {
      kind: 'purchase'
      disabled: boolean
      disabledNote?: string
      availability: EquipmentPurchaseAvailability
    }
  | {
      kind: 'magic_item_grant'
      disabled: boolean
      disabledNote?: string
      capabilities: Extract<
        EquipmentAcquisitionActionState,
        { kind: 'magic_item_grant' }
      >['capabilities']
      maxAdditionalQuantity: number
      plan: EquipmentAcquisitionPlan
      addBlockedNote?: string
      partialActionLabel?: string
    }

export const EQUIPMENT_PICKER_GRANT_SECTION_LABEL = 'Magic item acquisition'
export const EQUIPMENT_PICKER_GRANT_QUANTITY_LABEL = 'Quantity to add'
export const EQUIPMENT_PICKER_GRANT_MANAGE_LABEL = 'Manage choice'
export const EQUIPMENT_PICKER_GRANT_RELEASE_LABEL = 'Release one'
export const EQUIPMENT_PICKER_GRANT_COMMIT_LABEL = 'Use magic item choice'
export const EQUIPMENT_PICKER_GRANT_PARTIAL_PREFIX = 'Add'

export function formatPartialActionLabel(
  partialAction: NonNullable<EquipmentAcquisitionPlan['partialAction']>,
): string {
  if (partialAction.purchaseQuantity === 0) {
    return `${EQUIPMENT_PICKER_GRANT_PARTIAL_PREFIX} ${partialAction.requestedQuantity} with grant`
  }

  return `${EQUIPMENT_PICKER_GRANT_PARTIAL_PREFIX} ${partialAction.requestedQuantity} available`
}

export function formatAcquisitionBlockerNote(
  blocker: NonNullable<
    Extract<
      EquipmentAcquisitionActionState,
      { kind: 'magic_item_grant' }
    >['capabilities']['addBlockedReason']
  >,
): string {
  switch (blocker.code) {
    case 'duplicate_not_allowed':
      return 'You already own the maximum allowed copies of this item.'
    case 'no_matching_grant':
      return 'No matching magic item allowance is available.'
    case 'no_market_price':
      return EQUIPMENT_PICKER_NOT_PURCHASABLE_LABEL
    case 'cannot_afford':
      return EQUIPMENT_PICKER_CANNOT_AFFORD_LABEL
    default:
      return EQUIPMENT_PICKER_CANNOT_AFFORD_LABEL
  }
}

function buildPurchaseRowActionViewModel(
  actionState: Extract<EquipmentAcquisitionActionState, { kind: 'purchase' }>,
  options?: {
    budget?: EquipmentBudgetSummary
    pickerItem?: EquipmentPickerItem
  },
): Extract<EquipmentPickerRowActionViewModel, { kind: 'purchase' }> {
  const { availability } = actionState
  const disabled = availability.status === 'unavailable' || availability.status === 'unaffordable'

  let disabledNote: string | undefined
  if (availability.status === 'unavailable') {
    disabledNote = EQUIPMENT_PICKER_NOT_PURCHASABLE_LABEL
  } else if (availability.status === 'unaffordable' && options?.pickerItem && options.budget) {
    disabledNote = formatEquipmentUnaffordableReason(options.pickerItem, options.budget)
  }

  return { kind: 'purchase', disabled, disabledNote, availability }
}

function buildMagicItemGrantRowActionViewModel(
  actionState: Extract<EquipmentAcquisitionActionState, { kind: 'magic_item_grant' }>,
): Extract<EquipmentPickerRowActionViewModel, { kind: 'magic_item_grant' }> {
  const { capabilities, quantityBounds, plan } = actionState
  const disabled = !capabilities.canExpand
  const addBlockedNote =
    !capabilities.canAdd && capabilities.canExpand && capabilities.addBlockedReason
      ? formatAcquisitionBlockerNote(capabilities.addBlockedReason)
      : undefined

  return {
    kind: 'magic_item_grant',
    disabled,
    disabledNote: disabled ? (addBlockedNote ?? 'This item cannot be added.') : undefined,
    capabilities,
    maxAdditionalQuantity: quantityBounds.maxAdditionalQuantity,
    plan,
    addBlockedNote,
    partialActionLabel: plan.partialAction
      ? formatPartialActionLabel(plan.partialAction)
      : undefined,
  }
}

export function buildEquipmentPickerRowActionViewModel(
  actionState: EquipmentAcquisitionActionState,
  options?: {
    budget?: EquipmentBudgetSummary
    pickerItem?: EquipmentPickerItem
  },
): EquipmentPickerRowActionViewModel {
  if (actionState.kind === 'purchase') {
    return buildPurchaseRowActionViewModel(actionState, options)
  }

  return buildMagicItemGrantRowActionViewModel(actionState)
}
