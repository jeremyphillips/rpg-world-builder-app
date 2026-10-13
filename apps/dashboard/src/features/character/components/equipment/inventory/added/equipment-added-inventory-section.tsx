import { useState } from 'react'

import type {
  CharacterBuildCatalogIndex,
  CharacterBuildContext,
  CharacterBuilderDraft,
  EquipmentBudgetSummary,
} from '@rpg/contracts'
import { InsetPanel } from '@rpg/ui'

import { EquipmentCategoryGroupedList } from '@/features/content'

import {
  EQUIPMENT_ADDED_INVENTORY_EMPTY_MESSAGE,
  type EquipmentInventoryQuantityTarget,
  type EquipmentInventoryRemoveTarget,
} from '../../../../lib/equipment/equipment-step.lib'
import { EquipmentAddedInventoryRowItem } from '../added/equipment-added-inventory-row'
import type { AddedEquipmentCategoryGroup } from '../../../../lib/equipment/equipment-inventory-summary.lib'
import { resolveSelectionRowStatusItems } from '../../../../lib/selection-row-status'

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
        <InsetPanel.PassiveMessage>
          {EQUIPMENT_ADDED_INVENTORY_EMPTY_MESSAGE}
        </InsetPanel.PassiveMessage>
      </InsetPanel>
    )
  }

  return (
    <EquipmentCategoryGroupedList
      groups={addedEquipment.map((group) => ({
        groupLabel: group.groupLabel,
        items: group.entries,
      }))}
      getItemKey={(entry) => entry.equipmentId}
      renderRow={(entry) => (
        <EquipmentAddedInventoryRowItem
          entry={entry}
          status={resolveSelectionRowStatusItems(entry.selectionPresentation, {
            context: 'owned',
          })}
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
      )}
    />
  )
}
