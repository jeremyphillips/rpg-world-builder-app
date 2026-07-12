'use client'

import { Button, Heading } from '@rpg/ui'

import {
  EQUIPMENT_PURCHASED_INVENTORY_SECTION_LABEL,
  EQUIPMENT_STEP_BROWSE_LABEL,
  type EquipmentInventoryQuantityTarget,
  type EquipmentInventoryRemoveTarget,
} from '../../lib/equipment-step.lib'
import { EquipmentPurchasedInventorySection } from './equipment-purchased-inventory-section.client'
import type { PurchasedCategoryGroup } from './equipment-inventory-summary.lib'
import {
  equipmentInventoryColumnClasses,
  equipmentInventoryColumnHeaderClasses,
  equipmentInventoryColumnTitleRowClasses,
  equipmentInventoryColumnToolbarSpacerClasses,
  equipmentPurchasedInventoryPanelClasses,
} from './equipment-inventory-summary.variants'

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
    <section className={equipmentInventoryColumnClasses}>
      <div className={equipmentInventoryColumnHeaderClasses}>
        <div className={equipmentInventoryColumnTitleRowClasses}>
          <Heading variant="subsection" as="h3">
            {EQUIPMENT_PURCHASED_INVENTORY_SECTION_LABEL}
          </Heading>
          {showBrowseEquipment && onOpenPicker ? (
            <Button type="button" size="sm" onClick={onOpenPicker}>
              {EQUIPMENT_STEP_BROWSE_LABEL}
            </Button>
          ) : null}
        </div>
        {isPackageMode ? (
          <div className={equipmentInventoryColumnToolbarSpacerClasses} aria-hidden />
        ) : null}
      </div>
      <div className={equipmentPurchasedInventoryPanelClasses}>
        <EquipmentPurchasedInventorySection
          purchased={purchased}
          onRemoveItem={onRemoveItem}
          onSetPurchaseQuantity={onSetPurchaseQuantity}
        />
      </div>
    </section>
  )
}
