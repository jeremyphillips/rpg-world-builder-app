'use client'

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
  onAddAnother: (equipmentId: string) => void
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
  onAddAnother,
}: EquipmentAddedInventoryColumnProps) {
  return (
    <EquipmentInventoryColumn title={EQUIPMENT_ADDED_INVENTORY_SECTION_LABEL}>
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
        onAddAnother={onAddAnother}
      />
    </EquipmentInventoryColumn>
  )
}
