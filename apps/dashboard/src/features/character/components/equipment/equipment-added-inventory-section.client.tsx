'use client'

import { Eyebrow, InsetPanel } from '@rpg/ui'

import {
  EQUIPMENT_ADDED_INVENTORY_EMPTY_MESSAGE,
  type EquipmentInventoryQuantityTarget,
  type EquipmentInventoryRemoveTarget,
} from '../../lib/equipment-step.lib'
import { EquipmentInventoryRowItem } from './equipment-inventory-row.client'
import {
  groupEquipmentInventoryRowsForDisplay,
  type AddedEquipmentCategoryGroup,
} from './equipment-inventory-summary.lib'
import {
  equipmentInventoryRowListClasses,
  equipmentPurchasedInventoryCategoryClasses,
  equipmentPurchasedInventoryCategoryListClasses,
} from './equipment-inventory-summary.variants'

export type EquipmentAddedInventorySectionProps = {
  addedEquipment: AddedEquipmentCategoryGroup[]
  onRemoveItem?: (target: EquipmentInventoryRemoveTarget) => void
  onSetPurchaseQuantity?: (target: EquipmentInventoryQuantityTarget, quantity: number) => void
}

export function EquipmentAddedInventorySection({
  addedEquipment,
  onRemoveItem,
  onSetPurchaseQuantity,
}: EquipmentAddedInventorySectionProps) {
  const hasEntries = addedEquipment.some((group) => group.entries.length > 0)

  if (!hasEntries) {
    return (
      <InsetPanel size="sm" align="center" className="rounded-lg">
        <InsetPanel.Text>{EQUIPMENT_ADDED_INVENTORY_EMPTY_MESSAGE}</InsetPanel.Text>
      </InsetPanel>
    )
  }

  const showCategoryHeadings = addedEquipment.filter((group) => group.entries.length > 0).length > 1

  const renderEntryList = (entries: AddedEquipmentCategoryGroup['entries']) => (
    <ul className={equipmentInventoryRowListClasses}>
      {entries.map((entry) => {
        const display = groupEquipmentInventoryRowsForDisplay(entry.rows, {
          allowCombinedRows: true,
        })[0]
        if (!display) return null

        return (
          <li key={entry.equipmentId}>
            <EquipmentInventoryRowItem
              display={display}
              detailLabelOverride={entry.provenanceLabel}
              onRemoveItem={onRemoveItem}
              onSetPurchaseQuantity={onSetPurchaseQuantity}
            />
          </li>
        )
      })}
    </ul>
  )

  if (!showCategoryHeadings) {
    const flatEntries = addedEquipment.flatMap((group) => group.entries)
    return (
      <div className={equipmentPurchasedInventoryCategoryListClasses}>
        {renderEntryList(flatEntries)}
      </div>
    )
  }

  return (
    <div className={equipmentPurchasedInventoryCategoryListClasses}>
      {addedEquipment.map((group) =>
        group.entries.length === 0 ? null : (
          <section key={group.groupLabel} className={equipmentPurchasedInventoryCategoryClasses}>
            <Eyebrow size="sm">{group.groupLabel}</Eyebrow>
            {renderEntryList(group.entries)}
          </section>
        ),
      )}
    </div>
  )
}
