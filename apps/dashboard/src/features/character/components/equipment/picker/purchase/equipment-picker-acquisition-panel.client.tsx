'use client'

import { isEquipmentStackable, formatEquipmentBundleLabel, type Equipment } from '@rpg/contracts'

import type { EquipmentBudgetSummary } from '@rpg/contracts'

import { listEquipmentInventoryRowsForEquipment } from '../../../../lib/equipment/equipment-step.lib'
import {
  EQUIPMENT_PICKER_GRANT_MANAGE_LABEL,
  EQUIPMENT_PICKER_GRANT_SECTION_LABEL,
  type EquipmentPickerRowActionViewModel,
} from '../equipment-picker-action.lib'
import type { EquipmentPickerPurchaseViewModel } from './equipment-picker-purchase.lib'
import type { EquipmentPickerGrantViewModel } from './equipment-picker-grant.lib'
import type { EquipmentPickerDrawerProps } from '../drawer/equipment-picker-drawer.types'
import {
  EquipmentPickerGrantPanel,
  EquipmentPickerPurchasePanel,
  type EquipmentPickerGrantManageSource,
} from '../details/equipment-picker-item-details-sections.client'

export function EquipmentPickerAcquisitionPanel({
  equipment,
  rowActionVm,
  grantViewModel: _grantViewModel,
  manageSources: _manageSources,
  purchaseViewModel,
  ownedQuantity,
  purchaseDisabled,
  onAddQuantityChange,
  onCommit,
  onApplyMagicItemAcquisition,
  onReleaseGrant,
  onRemovePurchase,
  onRemoveFromInventory,
  onRemoveOneFromInventory,
  grantAcquisitionContext,
  budget,
}: {
  equipment: Equipment
  rowActionVm?: EquipmentPickerRowActionViewModel
  grantViewModel?: EquipmentPickerGrantViewModel
  manageSources?: EquipmentPickerGrantManageSource
  purchaseViewModel?: EquipmentPickerPurchaseViewModel
  ownedQuantity: number
  purchaseDisabled: boolean
  addQuantity: number
  onAddQuantityChange: (quantity: number) => void
  onCommit: () => void
  onApplyMagicItemAcquisition?: (requestedQuantity: number) => boolean
  onReleaseGrant?: (args: { allowanceId: string; equipmentId: string; quantity: number }) => void
  onRemovePurchase?: (args: { purchaseId: string; quantity: number }) => void
  onRemoveFromInventory?: () => void
  onRemoveOneFromInventory?: () => void
  grantAcquisitionContext?: EquipmentPickerDrawerProps['grantAcquisitionContext']
  budget?: EquipmentBudgetSummary
}) {
  const { draft, context, catalogIndex } = grantAcquisitionContext ?? {}

  if (
    rowActionVm?.kind === 'magic_item_grant' &&
    draft &&
    context &&
    catalogIndex &&
    onApplyMagicItemAcquisition
  ) {
    const rows = listEquipmentInventoryRowsForEquipment({
      equipmentId: equipment.id,
      draft,
      catalogIndex,
      budget,
      context,
    })
    const sectionLabel = rowActionVm.capabilities.canManage
      ? EQUIPMENT_PICKER_GRANT_MANAGE_LABEL
      : EQUIPMENT_PICKER_GRANT_SECTION_LABEL

    return (
      <EquipmentPickerGrantPanel
        equipment={equipment}
        rowActionVm={rowActionVm}
        grantViewModel={_grantViewModel!}
        manageSources={_manageSources ?? { grants: [], purchases: [] }}
        draft={draft}
        context={context}
        catalogIndex={catalogIndex}
        budget={budget}
        rows={rows}
        disabled={rowActionVm.disabled}
        sectionLabel={sectionLabel}
        onApplyMagicItemAcquisition={onApplyMagicItemAcquisition}
        onReleaseGrant={onReleaseGrant}
        onRemovePurchase={onRemovePurchase}
      />
    )
  }

  return (
    <EquipmentPickerPurchasePanel
      equipment={equipment}
      ownedQuantity={ownedQuantity}
      stackable={isEquipmentStackable(equipment)}
      disabled={purchaseDisabled}
      bundleLabel={formatEquipmentBundleLabel(equipment)}
      purchaseViewModel={purchaseViewModel}
      onAddQuantityChange={onAddQuantityChange}
      onCommit={onCommit}
      onRemoveFromInventory={onRemoveFromInventory}
      onRemoveOneFromInventory={onRemoveOneFromInventory}
    />
  )
}
