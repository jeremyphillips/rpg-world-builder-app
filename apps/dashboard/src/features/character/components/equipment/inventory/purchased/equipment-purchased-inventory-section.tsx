import { Eyebrow, InsetPanel } from '@rpg/ui'

import {
  EQUIPMENT_PURCHASED_INVENTORY_EMPTY_MESSAGE,
  type EquipmentInventoryQuantityTarget,
  type EquipmentInventoryRemoveTarget,
} from '../../../../lib/equipment/equipment-step.lib'
import { EquipmentInventoryRowItem } from '../row/equipment-inventory-row'
import {
  equipmentInventoryDisplayItemKey,
  type PurchasedCategoryGroup,
} from '../../../../lib/equipment/equipment-inventory-summary.lib'
import {
  equipmentInventoryRowListClasses,
  equipmentPurchasedInventoryCategoryClasses,
  equipmentPurchasedInventoryCategoryListClasses,
} from '../equipment-inventory.variants'

export type EquipmentPurchasedInventorySectionProps = {
  /** Items carry status already resolved for the trim modal's `reconciliation` context. */
  purchased: PurchasedCategoryGroup[]
  showGroupHeadings?: boolean
  allowZeroQuantity?: boolean
  onRemoveItem?: (target: EquipmentInventoryRemoveTarget) => void
  onSetPurchaseQuantity?: (target: EquipmentInventoryQuantityTarget, quantity: number) => void
}

export function EquipmentPurchasedInventorySection({
  purchased,
  showGroupHeadings = true,
  allowZeroQuantity = false,
  onRemoveItem,
  onSetPurchaseQuantity,
}: EquipmentPurchasedInventorySectionProps) {
  const hasPurchases = purchased.some((group) => group.items.length > 0)

  if (!hasPurchases) {
    return (
      <InsetPanel size="sm" align="center" className="rounded-lg">
        <InsetPanel.PassiveMessage>
          {EQUIPMENT_PURCHASED_INVENTORY_EMPTY_MESSAGE}
        </InsetPanel.PassiveMessage>
      </InsetPanel>
    )
  }

  const renderRowList = (items: PurchasedCategoryGroup['items']) => (
    <ul className={equipmentInventoryRowListClasses}>
      {items.map(({ display, status }) => (
        <li key={equipmentInventoryDisplayItemKey(display)}>
          <EquipmentInventoryRowItem
            display={display}
            status={status}
            allowZeroQuantity={allowZeroQuantity}
            onRemoveItem={onRemoveItem}
            onSetPurchaseQuantity={onSetPurchaseQuantity}
          />
        </li>
      ))}
    </ul>
  )

  if (!showGroupHeadings) {
    const flatItems = purchased.flatMap((group) => group.items)
    return (
      <div className={equipmentPurchasedInventoryCategoryListClasses}>
        {renderRowList(flatItems)}
      </div>
    )
  }

  return (
    <div className={equipmentPurchasedInventoryCategoryListClasses}>
      {purchased.map((group) =>
        group.items.length === 0 ? null : (
          <section key={group.groupLabel} className={equipmentPurchasedInventoryCategoryClasses}>
            <Eyebrow size="sm">{group.groupLabel}</Eyebrow>
            {renderRowList(group.items)}
          </section>
        ),
      )}
    </div>
  )
}
