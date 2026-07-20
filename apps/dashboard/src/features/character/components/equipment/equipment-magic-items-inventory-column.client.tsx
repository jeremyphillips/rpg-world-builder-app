'use client'

import { Button } from '@rpg/ui'

import {
  EQUIPMENT_MAGIC_ITEMS_CHOOSE_LABEL,
  EQUIPMENT_MAGIC_ITEMS_SECTION_LABEL,
  type EquipmentInventoryQuantityTarget,
  type EquipmentInventoryRemoveTarget,
} from '../../lib/equipment-step.lib'
import { EquipmentInventoryColumn } from './equipment-inventory-column.client'
import { EquipmentPurchasedInventorySection } from './equipment-purchased-inventory-section.client'
import type { PurchasedCategoryGroup } from './equipment-inventory-summary.lib'

export type EquipmentMagicItemsInventoryColumnProps = {
  magicItems: PurchasedCategoryGroup[]
  showChooseMagicItems?: boolean
  onOpenMagicItemsPicker?: () => void
  onRemoveItem?: (target: EquipmentInventoryRemoveTarget) => void
  onSetPurchaseQuantity?: (target: EquipmentInventoryQuantityTarget, quantity: number) => void
}

export function EquipmentMagicItemsInventoryColumn({
  magicItems,
  showChooseMagicItems = false,
  onOpenMagicItemsPicker,
  onRemoveItem,
  onSetPurchaseQuantity,
}: EquipmentMagicItemsInventoryColumnProps) {
  return (
    <EquipmentInventoryColumn
      title={EQUIPMENT_MAGIC_ITEMS_SECTION_LABEL}
      titleActions={
        showChooseMagicItems && onOpenMagicItemsPicker ? (
          <Button type="button" size="sm" onClick={onOpenMagicItemsPicker}>
            {EQUIPMENT_MAGIC_ITEMS_CHOOSE_LABEL}
          </Button>
        ) : undefined
      }
    >
      <EquipmentPurchasedInventorySection
        purchased={magicItems}
        onRemoveItem={onRemoveItem}
        onSetPurchaseQuantity={onSetPurchaseQuantity}
      />
    </EquipmentInventoryColumn>
  )
}
