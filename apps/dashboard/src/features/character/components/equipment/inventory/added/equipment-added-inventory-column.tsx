import { useMemo, useState } from 'react'

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
} from '../../../../lib/equipment/equipment-step.lib'
import { equipmentAddedInventoryPanelFilledClasses } from '../../acquisition/equipment-acquisition-panel.variants'
import { EquipmentAddedInventorySection } from '../added/equipment-added-inventory-section'
import { EquipmentInventoryColumn } from '../column/equipment-inventory-column'
import type { AddedEquipmentCategoryGroup } from '../../../../lib/equipment/equipment-inventory-summary.lib'

export type EquipmentAddedInventoryColumnProps = {
  addedEquipment: AddedEquipmentCategoryGroup[]
  draft: CharacterBuilderDraft
  context: CharacterBuildContext
  catalogIndex: CharacterBuildCatalogIndex
  budget?: EquipmentBudgetSummary
  reserveToolbarRow?: boolean
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
  reserveToolbarRow = false,
  onRemoveItem,
  onSetPurchaseQuantity,
  onReleaseGrant,
  onRemovePurchase,
  onApplyMagicItemAcquisition,
}: EquipmentAddedInventoryColumnProps) {
  const [openEquipmentId, setOpenEquipmentId] = useState<string | null>(null)

  const addedInventoryCount = useMemo(
    () =>
      addedEquipment
        .flatMap((group) => group.entries)
        .reduce((sum, entry) => sum + entry.totalQuantity, 0),
    [addedEquipment],
  )
  const hasEntries = addedInventoryCount > 0

  const section = (
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
  )

  return (
    <EquipmentInventoryColumn
      title={EQUIPMENT_ADDED_INVENTORY_SECTION_LABEL}
      titleBadgeCount={addedInventoryCount > 0 ? addedInventoryCount : undefined}
      reserveToolbarRow={reserveToolbarRow}
    >
      {hasEntries ? (
        <div className={equipmentAddedInventoryPanelFilledClasses}>{section}</div>
      ) : (
        section
      )}
    </EquipmentInventoryColumn>
  )
}
