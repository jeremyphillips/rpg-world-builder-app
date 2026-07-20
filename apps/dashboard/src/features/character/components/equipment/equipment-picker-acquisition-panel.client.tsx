'use client'

import { isEquipmentStackable, formatEquipmentBundleLabel, type Equipment } from '@rpg/contracts'

import type { EquipmentPickerRowActionViewModel } from './equipment-picker-action.lib'
import type { EquipmentPickerPurchaseViewModel } from './equipment-picker-purchase.lib'
import type { EquipmentPickerGrantViewModel } from './equipment-picker-grant.lib'
import {
  EquipmentPickerGrantPanel,
  EquipmentPickerPurchasePanel,
  type EquipmentPickerGrantManageSource,
} from './equipment-picker-item-details-sections.client'

export function EquipmentPickerAcquisitionPanel({
  equipment,
  rowActionVm,
  grantViewModel,
  manageSources,
  purchaseViewModel,
  ownedQuantity,
  purchaseDisabled,
  addQuantity,
  onAddQuantityChange,
  onCommit,
  onApplyMagicItemAcquisition,
  onApplyPurchase,
  onReleaseGrant,
  onRemovePurchase,
  onRemoveFromInventory,
  onRemoveOneFromInventory,
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
  onApplyMagicItemAcquisition?: (requestedQuantity: number) => void
  onApplyPurchase?: (requestedQuantity: number) => void
  onReleaseGrant?: (args: { allowanceId: string; equipmentId: string; quantity: number }) => void
  onRemovePurchase?: (args: { purchaseId: string; quantity: number }) => void
  onRemoveFromInventory?: () => void
  onRemoveOneFromInventory?: () => void
}) {
  if (rowActionVm?.kind === 'magic_item_grant' && grantViewModel && manageSources) {
    return (
      <EquipmentPickerGrantPanel
        equipment={equipment}
        rowActionVm={rowActionVm}
        grantViewModel={grantViewModel}
        manageSources={manageSources}
        disabled={rowActionVm.disabled}
        onAddQuantityChange={onAddQuantityChange}
        onApplyMagicItemAcquisition={(quantity) => onApplyMagicItemAcquisition?.(quantity)}
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
      onCommit={() => {
        if (rowActionVm?.kind === 'purchase' && onApplyPurchase) {
          onApplyPurchase(addQuantity)
          return
        }
        onCommit()
      }}
      onRemoveFromInventory={onRemoveFromInventory}
      onRemoveOneFromInventory={onRemoveOneFromInventory}
    />
  )
}
