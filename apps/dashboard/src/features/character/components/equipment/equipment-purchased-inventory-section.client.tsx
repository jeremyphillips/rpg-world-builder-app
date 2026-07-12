'use client'

import { Eyebrow, Text } from '@rpg/ui'

import {
  EQUIPMENT_PURCHASED_INVENTORY_EMPTY_MESSAGE,
  type EquipmentInventoryQuantityTarget,
  type EquipmentInventoryRemoveTarget,
} from '../../lib/equipment-step.lib'
import { EquipmentInventoryRowItem } from './equipment-inventory-row.client'
import {
  equipmentInventoryDisplayItemKey,
  type PurchasedCategoryGroup,
} from './equipment-inventory-summary.lib'
import {
  equipmentPurchasedInventoryCategoryClasses,
  equipmentPurchasedInventoryCategoryListClasses,
} from './equipment-inventory-summary.variants'

export type EquipmentPurchasedInventorySectionProps = {
  purchased: PurchasedCategoryGroup[]
  onRemoveItem?: (target: EquipmentInventoryRemoveTarget) => void
  onSetPurchaseQuantity?: (target: EquipmentInventoryQuantityTarget, quantity: number) => void
}

export function EquipmentPurchasedInventorySection({
  purchased,
  onRemoveItem,
  onSetPurchaseQuantity,
}: EquipmentPurchasedInventorySectionProps) {
  const hasPurchases = purchased.some((group) => group.displays.length > 0)

  if (!hasPurchases) {
    return <Text variant="muted">{EQUIPMENT_PURCHASED_INVENTORY_EMPTY_MESSAGE}</Text>
  }

  return (
    <div className={equipmentPurchasedInventoryCategoryListClasses}>
      {purchased.map((group) =>
        group.displays.length === 0 ? null : (
          <section key={group.groupLabel} className={equipmentPurchasedInventoryCategoryClasses}>
            <Eyebrow size="sm">{group.groupLabel}</Eyebrow>
            <ul>
              {group.displays.map((display) => (
                <li key={equipmentInventoryDisplayItemKey(display)}>
                  <EquipmentInventoryRowItem
                    display={display}
                    onRemoveItem={onRemoveItem}
                    onSetPurchaseQuantity={onSetPurchaseQuantity}
                  />
                </li>
              ))}
            </ul>
          </section>
        ),
      )}
    </div>
  )
}
