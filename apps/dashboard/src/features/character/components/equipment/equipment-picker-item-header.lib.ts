import type { Equipment, MagicItemRarity } from '@rpg/contracts'
import { getMagicItemRarityLabel } from '@rpg/contracts'

import type { EquipmentPickerRowViewModel } from '@/features/content'

import type { EquipmentPickerWorkflowMode } from '../../lib/equipment-step.lib'
import type { EquipmentPickerRowActionViewModel } from './equipment-picker-action.lib'
import { formatGrantPreviewLine } from './equipment-acquisition-panel.lib'
import {
  EQUIPMENT_PICKER_CANNOT_AFFORD_LABEL,
  EQUIPMENT_PICKER_NOT_PURCHASABLE_LABEL,
} from './equipment-picker-drawer.types'

export type EquipmentPickerHeaderAction =
  | { kind: 'add'; disabled: boolean }
  | { kind: 'manage_only' }
  | { kind: 'none' }

export type EquipmentPickerSummaryTrailingTone = 'default' | 'muted' | 'blocked'

export type EquipmentPickerItemHeaderPresentation = {
  summaryTrailingLabel?: string
  summaryTrailingTone?: EquipmentPickerSummaryTrailingTone
  action: EquipmentPickerHeaderAction
}

type EquipmentAcquisitionBlocker = NonNullable<
  Extract<
    EquipmentPickerRowActionViewModel,
    { kind: 'magic_item_grant' }
  >['capabilities']['addBlockedReason']
>

export function formatEquipmentPickerHeaderTrailingLabel(args: {
  blocker: EquipmentAcquisitionBlocker
  rarity?: MagicItemRarity
}): string {
  switch (args.blocker.code) {
    case 'no_matching_grant':
      return args.rarity ? `No ${getMagicItemRarityLabel(args.rarity)} choices` : 'Unavailable'
    case 'duplicate_not_allowed':
      return 'One copy maximum'
    case 'no_market_price':
      return EQUIPMENT_PICKER_NOT_PURCHASABLE_LABEL
    case 'cannot_afford':
      return EQUIPMENT_PICKER_CANNOT_AFFORD_LABEL
    default:
      return 'Unavailable'
  }
}

function resolveHeaderAction(args: {
  canAdd: boolean
  ownedQuantity: number
}): EquipmentPickerHeaderAction {
  if (args.canAdd) return { kind: 'add', disabled: false }
  if (args.ownedQuantity > 0) return { kind: 'manage_only' }
  return { kind: 'none' }
}

function resolveMagicItemGrantTrailing(args: {
  rowActionVm: Extract<EquipmentPickerRowActionViewModel, { kind: 'magic_item_grant' }>
  row: EquipmentPickerRowViewModel
  equipment: Equipment
}): Pick<EquipmentPickerItemHeaderPresentation, 'summaryTrailingLabel' | 'summaryTrailingTone'> {
  const { plan, capabilities } = args.rowActionVm
  const grantQuantity = plan.grantAllocations.reduce(
    (sum, allocation) => sum + allocation.quantity,
    0,
  )
  const purchaseQuantity = plan.purchaseQuantity
  const rarity = args.equipment.kind === 'magic_item' ? args.equipment.rarity : undefined

  if (grantQuantity > 0 && rarity) {
    return {
      summaryTrailingLabel: formatGrantPreviewLine(grantQuantity, rarity),
      summaryTrailingTone: 'default',
    }
  }

  if (plan.fulfilledQuantity === 1 && grantQuantity === 0 && purchaseQuantity === 1) {
    return {
      summaryTrailingLabel: args.row.priceLabel || undefined,
      summaryTrailingTone: args.row.priceLabel ? 'default' : 'muted',
    }
  }

  const blocker = capabilities.addBlockedReason ?? plan.blockers[0]
  if (blocker) {
    return {
      summaryTrailingLabel: formatEquipmentPickerHeaderTrailingLabel({ blocker, rarity }),
      summaryTrailingTone: 'blocked',
    }
  }

  return {}
}

function resolvePurchasePresentation(args: {
  rowActionVm: Extract<EquipmentPickerRowActionViewModel, { kind: 'purchase' }>
  row: EquipmentPickerRowViewModel
  ownedQuantity: number
}): EquipmentPickerItemHeaderPresentation {
  const { availability, disabled } = args.rowActionVm

  if (availability.status === 'unavailable') {
    return {
      summaryTrailingLabel: formatEquipmentPickerHeaderTrailingLabel({
        blocker: { code: 'no_market_price' },
      }),
      summaryTrailingTone: 'blocked',
      action: { kind: 'none' },
    }
  }

  const trailingLabel = args.row.priceLabel || undefined
  const action: EquipmentPickerHeaderAction = disabled
    ? { kind: 'add', disabled: true }
    : { kind: 'add', disabled: false }

  if (availability.status === 'unaffordable') {
    return {
      summaryTrailingLabel: trailingLabel ?? EQUIPMENT_PICKER_CANNOT_AFFORD_LABEL,
      summaryTrailingTone: trailingLabel ? 'muted' : 'blocked',
      action: args.ownedQuantity > 0 ? { kind: 'manage_only' } : action,
    }
  }

  return {
    summaryTrailingLabel: trailingLabel,
    summaryTrailingTone: trailingLabel ? 'default' : undefined,
    action: resolveHeaderAction({ canAdd: !disabled, ownedQuantity: args.ownedQuantity }),
  }
}

export function resolveEquipmentPickerItemHeaderPresentation(args: {
  equipment: Equipment
  row: EquipmentPickerRowViewModel
  workflowMode: EquipmentPickerWorkflowMode
  rowActionVm: EquipmentPickerRowActionViewModel
  ownedQuantity: number
}): EquipmentPickerItemHeaderPresentation {
  const { equipment, row, workflowMode, rowActionVm, ownedQuantity } = args

  if (workflowMode === 'purchase' && rowActionVm.kind === 'purchase') {
    return resolvePurchasePresentation({ rowActionVm, row, ownedQuantity })
  }

  if (rowActionVm.kind !== 'magic_item_grant') {
    return { action: { kind: 'none' } }
  }

  const trailing = resolveMagicItemGrantTrailing({ rowActionVm, row, equipment })

  return {
    ...trailing,
    action: resolveHeaderAction({
      canAdd: rowActionVm.capabilities.canAdd,
      ownedQuantity,
    }),
  }
}
