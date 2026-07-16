'use client'

import { Button } from '@rpg/ui'

import {
  EQUIPMENT_PURCHASED_INVENTORY_SECTION_LABEL,
  EQUIPMENT_STEP_BROWSE_LABEL,
  type EquipmentInventoryQuantityTarget,
  type EquipmentInventoryRemoveTarget,
} from '../../lib/equipment-step.lib'
import { EquipmentInventoryColumn } from './equipment-inventory-column.client'
import { EquipmentPurchasedInventorySection } from './equipment-purchased-inventory-section.client'
import type { PurchasedCategoryGroup } from './equipment-inventory-summary.lib'
import { equipmentPurchasedInventoryPanelClasses } from './equipment-inventory-summary.variants'

export type EquipmentPurchasedInventoryColumnProps = {
  purchased: PurchasedCategoryGroup[]
  isPackageMode: boolean
  showBrowseEquipment?: boolean
  onOpenPicker?: () => void
  onRemoveItem?: (target: EquipmentInventoryRemoveTarget) => void
  onSetPurchaseQuantity?: (target: EquipmentInventoryQuantityTarget, quantity: number) => void
}

export function EquipmentPurchasedInventoryColumn({
  purchased,
  isPackageMode,
  showBrowseEquipment = false,
  onOpenPicker,
  onRemoveItem,
  onSetPurchaseQuantity,
}: EquipmentPurchasedInventoryColumnProps) {
  return (
    <EquipmentInventoryColumn
      title={EQUIPMENT_PURCHASED_INVENTORY_SECTION_LABEL}
      titleActions={
        showBrowseEquipment && onOpenPicker ? (
          <Button type="button" size="sm" onClick={onOpenPicker}>
            {EQUIPMENT_STEP_BROWSE_LABEL}
          </Button>
        ) : undefined
      }
      reserveToolbarRow={isPackageMode}
    >
      <div className={equipmentPurchasedInventoryPanelClasses}>
        <EquipmentPurchasedInventorySection
          purchased={purchased}
          onRemoveItem={onRemoveItem}
          onSetPurchaseQuantity={onSetPurchaseQuantity}
        />
      </div>
    </EquipmentInventoryColumn>
  )
}
