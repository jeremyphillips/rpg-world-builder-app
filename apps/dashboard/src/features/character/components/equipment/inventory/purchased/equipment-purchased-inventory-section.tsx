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
  const hasPurchases = purchased.some((group) => group.displays.length > 0)

  if (!hasPurchases) {
    return (
      <InsetPanel size="sm" align="center" className="rounded-lg">
        <InsetPanel.Text>{EQUIPMENT_PURCHASED_INVENTORY_EMPTY_MESSAGE}</InsetPanel.Text>
      </InsetPanel>
    )
  }

  const renderRowList = (displays: PurchasedCategoryGroup['displays']) => (
    <ul className={equipmentInventoryRowListClasses}>
      {displays.map((display) => (
        <li key={equipmentInventoryDisplayItemKey(display)}>
          <EquipmentInventoryRowItem
            display={display}
            allowZeroQuantity={allowZeroQuantity}
            onRemoveItem={onRemoveItem}
            onSetPurchaseQuantity={onSetPurchaseQuantity}
          />
        </li>
      ))}
    </ul>
  )

  if (!showGroupHeadings) {
    const flatDisplays = purchased.flatMap((group) => group.displays)
    return (
      <div className={equipmentPurchasedInventoryCategoryListClasses}>
        {renderRowList(flatDisplays)}
      </div>
    )
  }

  return (
    <div className={equipmentPurchasedInventoryCategoryListClasses}>
      {purchased.map((group) =>
        group.displays.length === 0 ? null : (
          <section key={group.groupLabel} className={equipmentPurchasedInventoryCategoryClasses}>
            <Eyebrow size="sm">{group.groupLabel}</Eyebrow>
            {renderRowList(group.displays)}
          </section>
        ),
      )}
    </div>
  )
}
