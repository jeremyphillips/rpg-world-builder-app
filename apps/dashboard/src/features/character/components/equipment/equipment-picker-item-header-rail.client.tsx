'use client'

import { useEquipmentAcquisitionQuantityCommit } from '../../hooks/use-equipment-acquisition-quantity-commit.client'
import { resolveAcquisitionCommitButtonLabel } from './equipment-acquisition-commit-labels.lib'
import { getEquipmentPickerCallout } from './equipment-picker-callout.lib'
import type { EquipmentPickerItem } from './equipment-picker-drawer.types'
import { EquipmentPickerItemHeader } from './equipment-picker-item-header.client'
import type { EquipmentPickerItemHeaderPresentation } from './equipment-picker-item-header.lib'
import { buildEquipmentPickerRowViewModel } from '@/features/content'

const EQUIPMENT_PICKER_HEADER_ADD_LABEL = 'Add'

export type EquipmentPickerItemHeaderRailProps = {
  item: EquipmentPickerItem
  presentation: EquipmentPickerItemHeaderPresentation
  ownedQuantity: number
  isGoldShoppingPath?: boolean
  onCommit?: () => boolean
}

export function EquipmentPickerItemHeaderRail({
  item,
  presentation,
  ownedQuantity,
  isGoldShoppingPath = false,
  onCommit,
}: EquipmentPickerItemHeaderRailProps) {
  const { isPending, successQuantity, commitQuantity } = useEquipmentAcquisitionQuantityCommit({
    commit: () => onCommit?.() ?? false,
  })

  const row = buildEquipmentPickerRowViewModel(item.equipment)
  const callout = getEquipmentPickerCallout(item, { isGoldShoppingPath })
  const showAdd = presentation.action.kind === 'add' && Boolean(onCommit)
  const addButtonLabel = resolveAcquisitionCommitButtonLabel({
    isPending,
    successQuantity,
    primaryActionLabel: EQUIPMENT_PICKER_HEADER_ADD_LABEL,
  })

  return (
    <EquipmentPickerItemHeader
      item={row}
      callout={callout}
      summaryTrailingLabel={presentation.summaryTrailingLabel}
      summaryTrailingTone={presentation.summaryTrailingTone}
      action={presentation.action}
      ownedQuantity={ownedQuantity}
      addButtonLabel={addButtonLabel}
      isPending={isPending}
      onAdd={showAdd ? () => commitQuantity(1) : undefined}
    />
  )
}
