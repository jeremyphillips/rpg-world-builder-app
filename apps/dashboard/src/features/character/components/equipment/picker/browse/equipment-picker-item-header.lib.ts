import type { Equipment, MagicItemRarity } from '@rpg/contracts'
import { getMagicItemRarityLabel } from '@rpg/contracts'

import type {
  EntityAnatomyTrailingSecondary,
  EntitySummaryStatusItem,
  EquipmentPickerRowViewModel,
} from '@/features/content'

import type { EquipmentPickerWorkflowMode } from '../../../../lib/equipment/equipment-step.lib'
import type { EquipmentPickerRowActionViewModel } from '../equipment-picker-action.lib'
import { formatGrantPreviewLine } from '../../acquisition/equipment-acquisition-panel.lib'
import {
  EQUIPMENT_PICKER_CANNOT_AFFORD_LABEL,
  EQUIPMENT_PICKER_NOT_PURCHASABLE_LABEL,
} from '../drawer/equipment-picker-drawer.types'

export type EquipmentPickerAction =
  | { kind: 'add'; disabled: boolean }
  | { kind: 'manage_only' }
  | { kind: 'none' }

export type EquipmentPickerItemPresentation = {
  secondary?: EntityAnatomyTrailingSecondary
  statusItems?: readonly EntitySummaryStatusItem[]
  action: EquipmentPickerAction
}

type EquipmentAcquisitionBlocker = NonNullable<
  Extract<
    EquipmentPickerRowActionViewModel,
    { kind: 'magic_item_grant' }
  >['capabilities']['addBlockedReason']
>

function blockerStatusItem(label: string): EntitySummaryStatusItem {
  return {
    kind: 'badge',
    label,
    tone: 'destructive',
    appearance: 'soft',
    leadingIcon: 'warning',
  }
}

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
}): EquipmentPickerAction {
  if (args.canAdd) return { kind: 'add', disabled: false }
  if (args.ownedQuantity > 0) return { kind: 'manage_only' }
  return { kind: 'none' }
}

function resolveMagicItemGrantTrailing(args: {
  rowActionVm: Extract<EquipmentPickerRowActionViewModel, { kind: 'magic_item_grant' }>
  row: EquipmentPickerRowViewModel
  equipment: Equipment
}): Pick<EquipmentPickerItemPresentation, 'secondary' | 'statusItems'> {
  const { plan, capabilities } = args.rowActionVm
  const grantQuantity = plan.grantAllocations.reduce(
    (sum, allocation) => sum + allocation.quantity,
    0,
  )
  const purchaseQuantity = plan.purchaseQuantity
  const rarity = args.equipment.kind === 'magic_item' ? args.equipment.rarity : undefined

  if (grantQuantity > 0 && rarity) {
    return {
      secondary: {
        kind: 'grantPreview',
        label: formatGrantPreviewLine(grantQuantity, rarity),
      },
    }
  }

  if (plan.fulfilledQuantity === 1 && grantQuantity === 0 && purchaseQuantity === 1) {
    return args.row.priceLabel ? { secondary: { kind: 'price', label: args.row.priceLabel } } : {}
  }

  const blocker = capabilities.addBlockedReason ?? plan.blockers[0]
  if (blocker) {
    return {
      statusItems: [
        blockerStatusItem(formatEquipmentPickerHeaderTrailingLabel({ blocker, rarity })),
      ],
    }
  }

  return {}
}

function resolvePurchasePresentation(args: {
  rowActionVm: Extract<EquipmentPickerRowActionViewModel, { kind: 'purchase' }>
  row: EquipmentPickerRowViewModel
  ownedQuantity: number
}): EquipmentPickerItemPresentation {
  const { availability, disabled } = args.rowActionVm

  if (availability.status === 'unavailable') {
    return {
      statusItems: [
        blockerStatusItem(
          formatEquipmentPickerHeaderTrailingLabel({
            blocker: { code: 'no_market_price' },
          }),
        ),
      ],
      action: { kind: 'none' },
    }
  }

  const priceLabel = args.row.priceLabel || undefined
  const action: EquipmentPickerAction = disabled
    ? { kind: 'add', disabled: true }
    : { kind: 'add', disabled: false }

  if (availability.status === 'unaffordable') {
    return {
      ...(priceLabel
        ? { secondary: { kind: 'price', label: priceLabel } }
        : {
            statusItems: [blockerStatusItem(EQUIPMENT_PICKER_CANNOT_AFFORD_LABEL)],
          }),
      action: args.ownedQuantity > 0 ? { kind: 'manage_only' } : action,
    }
  }

  return {
    ...(priceLabel ? { secondary: { kind: 'price', label: priceLabel } } : {}),
    action: resolveHeaderAction({ canAdd: !disabled, ownedQuantity: args.ownedQuantity }),
  }
}

export function resolveEquipmentPickerItemPresentation(args: {
  equipment: Equipment
  row: EquipmentPickerRowViewModel
  workflowMode: EquipmentPickerWorkflowMode
  rowActionVm: EquipmentPickerRowActionViewModel
  ownedQuantity: number
}): EquipmentPickerItemPresentation {
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
