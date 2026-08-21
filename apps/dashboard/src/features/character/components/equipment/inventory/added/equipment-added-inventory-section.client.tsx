'use client'

import { useState } from 'react'

import type {
  CharacterBuildCatalogIndex,
  CharacterBuildContext,
  CharacterBuilderDraft,
  EquipmentBudgetSummary,
} from '@rpg/contracts'
import { Eyebrow, InsetPanel } from '@rpg/ui'

import {
  EQUIPMENT_ADDED_INVENTORY_EMPTY_MESSAGE,
  type EquipmentInventoryQuantityTarget,
  type EquipmentInventoryRemoveTarget,
} from '../../../../lib/equipment/equipment-step.lib'
import { EquipmentAddedInventoryRowItem } from '../added/equipment-added-inventory-row.client'
import type { AddedEquipmentCategoryGroup } from '../../../../lib/equipment/equipment-inventory-summary.lib'
import {
  equipmentInventoryRowListClasses,
  equipmentPurchasedInventoryCategoryClasses,
  equipmentPurchasedInventoryCategoryListClasses,
} from '../equipment-inventory.variants'

export type EquipmentAddedInventorySectionProps = {
  addedEquipment: AddedEquipmentCategoryGroup[]
  draft: CharacterBuilderDraft
  context: CharacterBuildContext
  catalogIndex: CharacterBuildCatalogIndex
  budget?: EquipmentBudgetSummary
  onRemoveItem?: (target: EquipmentInventoryRemoveTarget) => void
  onSetPurchaseQuantity?: (target: EquipmentInventoryQuantityTarget, quantity: number) => void
  onReleaseGrant: (args: { allowanceId: string; equipmentId: string; quantity: number }) => void
  onRemovePurchase: (args: { purchaseId: string; quantity: number }) => void
  onApplyMagicItemAcquisition: (args: { equipmentId: string; requestedQuantity: number }) => boolean
  openEquipmentId?: string | null
  onOpenEquipmentChange?: (equipmentId: string | null) => void
}

export function EquipmentAddedInventorySection({
  addedEquipment,
  draft,
  context,
  catalogIndex,
  budget,
  onRemoveItem,
  onSetPurchaseQuantity,
  onReleaseGrant,
  onRemovePurchase,
  onApplyMagicItemAcquisition,
  openEquipmentId,
  onOpenEquipmentChange,
}: EquipmentAddedInventorySectionProps) {
  const [localOpenEquipmentId, setLocalOpenEquipmentId] = useState<string | null>(null)
  const resolvedOpenEquipmentId = openEquipmentId ?? localOpenEquipmentId
  const setOpenEquipmentId = onOpenEquipmentChange ?? setLocalOpenEquipmentId

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
      {entries.map((entry) => (
        <li key={entry.equipmentId}>
          <EquipmentAddedInventoryRowItem
            entry={entry}
            draft={draft}
            context={context}
            catalogIndex={catalogIndex}
            budget={budget}
            onRemoveItem={onRemoveItem}
            onSetPurchaseQuantity={onSetPurchaseQuantity}
            onReleaseGrant={onReleaseGrant}
            onRemovePurchase={onRemovePurchase}
            onApplyMagicItemAcquisition={onApplyMagicItemAcquisition}
            open={resolvedOpenEquipmentId === entry.equipmentId}
            onOpenChange={(open) => setOpenEquipmentId(open ? entry.equipmentId : null)}
          />
        </li>
      ))}
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
