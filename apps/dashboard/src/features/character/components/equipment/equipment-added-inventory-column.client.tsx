'use client'

import { useState } from 'react'

import type {
  CharacterBuildCatalogIndex,
  CharacterBuildContext,
  CharacterBuilderDraft,
  EquipmentBudgetSummary,
} from '@rpg/contracts'

import {
  EQUIPMENT_ADDED_INVENTORY_SECTION_LABEL,
  type EquipmentInventoryQuantityTarget,
  type EquipmentInventoryRemoveTarget,
} from '../../lib/equipment-step.lib'
import { equipmentAddedInventoryPanelClasses } from './equipment-acquisition-panel.variants'
import { EquipmentAddedInventorySection } from './equipment-added-inventory-section.client'
import { EquipmentInventoryColumn } from './equipment-inventory-column.client'
import type { AddedEquipmentCategoryGroup } from './equipment-inventory-summary.lib'

export type EquipmentAddedInventoryColumnProps = {
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
}

export function EquipmentAddedInventoryColumn({
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
}: EquipmentAddedInventoryColumnProps) {
  const [openEquipmentId, setOpenEquipmentId] = useState<string | null>(null)

  return (
    <EquipmentInventoryColumn title={EQUIPMENT_ADDED_INVENTORY_SECTION_LABEL}>
      <div className={equipmentAddedInventoryPanelClasses}>
        <EquipmentAddedInventorySection
          addedEquipment={addedEquipment}
          draft={draft}
          context={context}
          catalogIndex={catalogIndex}
          budget={budget}
          onRemoveItem={onRemoveItem}
          onSetPurchaseQuantity={onSetPurchaseQuantity}
          onReleaseGrant={onReleaseGrant}
          onRemovePurchase={onRemovePurchase}
          onApplyMagicItemAcquisition={onApplyMagicItemAcquisition}
          openEquipmentId={openEquipmentId}
          onOpenEquipmentChange={setOpenEquipmentId}
        />
      </div>
    </EquipmentInventoryColumn>
  )
}
