'use client'

import {
  EQUIPMENT_ADDED_INVENTORY_SECTION_LABEL,
  type EquipmentInventoryQuantityTarget,
  type EquipmentInventoryRemoveTarget,
} from '../../lib/equipment-step.lib'
import { EquipmentAddedInventorySection } from './equipment-added-inventory-section.client'
import { EquipmentInventoryColumn } from './equipment-inventory-column.client'
import type { AddedEquipmentCategoryGroup } from './equipment-inventory-summary.lib'

export type EquipmentAddedInventoryColumnProps = {
  addedEquipment: AddedEquipmentCategoryGroup[]
  onRemoveItem?: (target: EquipmentInventoryRemoveTarget) => void
  onSetPurchaseQuantity?: (target: EquipmentInventoryQuantityTarget, quantity: number) => void
}

export function EquipmentAddedInventoryColumn({
  addedEquipment,
  onRemoveItem,
  onSetPurchaseQuantity,
}: EquipmentAddedInventoryColumnProps) {
  return (
    <EquipmentInventoryColumn title={EQUIPMENT_ADDED_INVENTORY_SECTION_LABEL}>
      <EquipmentAddedInventorySection
        addedEquipment={addedEquipment}
        onRemoveItem={onRemoveItem}
        onSetPurchaseQuantity={onSetPurchaseQuantity}
      />
    </EquipmentInventoryColumn>
  )
}
