'use client'

import { useCallback, useState } from 'react'

import type {
  CharacterBuildCatalogIndex,
  CharacterBuildContext,
  CharacterBuilderDraft,
  EquipmentBudgetSummary,
} from '@rpg/contracts'
import { ContentEntityCard, DisclosureEntityCard } from '@/features/content'
import {
  EQUIPMENT_INVENTORY_RELEASE_LABEL,
  type EquipmentInventoryQuantityTarget,
  type EquipmentInventoryRemoveTarget,
} from '../../../../lib/equipment/equipment-step.lib'
import { EquipmentInventorySourceActionButton } from '../equipment-inventory-source-action-button.client'
import { EquipmentInventoryManagePanelBody } from '../manage/equipment-inventory-manage-panel.client'
import {
  groupEquipmentInventoryRowsForDisplay,
  type AddedEquipmentEntryViewModel,
} from '../../../../lib/equipment/equipment-inventory-summary.lib'
import { buildEquipmentInventoryRowEntity } from '../equipment-inventory-entity.lib'
import { EquipmentInventoryRowItem } from '../row/equipment-inventory-row.client'
import {
  grantedQuantity,
  resolveDistinctAcquisitionSourceKinds,
  usesInlineManagement,
} from '../manage/equipment-inventory-manage.lib'

export type EquipmentAddedInventoryRowItemProps = {
  entry: AddedEquipmentEntryViewModel
  draft: CharacterBuilderDraft
  context: CharacterBuildContext
  catalogIndex: CharacterBuildCatalogIndex
  budget?: EquipmentBudgetSummary
  onRemoveItem?: (target: EquipmentInventoryRemoveTarget) => void
  onSetPurchaseQuantity?: (target: EquipmentInventoryQuantityTarget, quantity: number) => void
  onReleaseGrant: (args: { allowanceId: string; equipmentId: string; quantity: number }) => void
  onRemovePurchase: (args: { purchaseId: string; quantity: number }) => void
  onApplyMagicItemAcquisition: (args: { equipmentId: string; requestedQuantity: number }) => boolean
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

function GrantOnlySingleReleaseRow({
  entry,
  onReleaseGrant,
}: {
  entry: AddedEquipmentEntryViewModel
  onReleaseGrant: EquipmentAddedInventoryRowItemProps['onReleaseGrant']
}) {
  const row = entry.rows.find((candidate) => candidate.removeTarget?.kind === 'magicItemGrant')
  if (!row?.removeTarget || row.removeTarget.kind !== 'magicItemGrant') return null

  const removeTarget = row.removeTarget

  return (
    <ContentEntityCard
      entity={buildEquipmentInventoryRowEntity({
        equipmentName: entry.equipmentName,
        detailLabel: entry.provenanceLabel,
      })}
      trailing={{
        kind: 'action',
        content: (
          <EquipmentInventorySourceActionButton
            onClick={() =>
              onReleaseGrant({
                allowanceId: removeTarget.allowanceId,
                equipmentId: removeTarget.equipmentId,
                quantity: 1,
              })
            }
          >
            {EQUIPMENT_INVENTORY_RELEASE_LABEL}
          </EquipmentInventorySourceActionButton>
        ),
      }}
      density="compact"
    />
  )
}

function ManagedInventoryRow({
  entry,
  totalQuantity,
  draft,
  context,
  catalogIndex,
  budget,
  onReleaseGrant,
  onRemovePurchase,
  onApplyMagicItemAcquisition,
  open,
  onOpenChange,
}: {
  entry: AddedEquipmentEntryViewModel
  totalQuantity: number
  draft: CharacterBuilderDraft
  context: CharacterBuildContext
  catalogIndex: CharacterBuildCatalogIndex
  budget?: EquipmentBudgetSummary
  onReleaseGrant: EquipmentAddedInventoryRowItemProps['onReleaseGrant']
  onRemovePurchase: EquipmentAddedInventoryRowItemProps['onRemovePurchase']
  onApplyMagicItemAcquisition: EquipmentAddedInventoryRowItemProps['onApplyMagicItemAcquisition']
  open?: boolean
  onOpenChange?: (open: boolean) => void
}) {
  const [internalOpen, setInternalOpen] = useState(false)
  const isOpen = open ?? internalOpen
  const equipment = entry.rows.find((row) => row.equipment)?.equipment

  const handleToggleCollapse = useCallback(() => {
    const next = !isOpen
    if (onOpenChange) onOpenChange(next)
    else setInternalOpen(next)
  }, [isOpen, onOpenChange])

  if (!equipment) return null

  return (
    <DisclosureEntityCard
      itemId={entry.equipmentId}
      toolbarAriaLabel={entry.equipmentName}
      entity={buildEquipmentInventoryRowEntity({
        equipmentName: entry.equipmentName,
        detailLabel: entry.provenanceLabel,
      })}
      trailing={{
        kind: 'indicator',
        variant: 'quantity',
        quantity: totalQuantity,
        format: 'label',
      }}
      collapsed={!isOpen}
      onToggleCollapse={handleToggleCollapse}
      density="compact"
    >
      <EquipmentInventoryManagePanelBody
        equipment={equipment}
        rows={entry.rows}
        draft={draft}
        context={context}
        catalogIndex={catalogIndex}
        budget={budget}
        onReleaseGrant={onReleaseGrant}
        onRemovePurchase={onRemovePurchase}
        onApplyMagicItemAcquisition={onApplyMagicItemAcquisition}
      />
    </DisclosureEntityCard>
  )
}

export function EquipmentAddedInventoryRowItem({
  entry,
  draft,
  context,
  catalogIndex,
  budget,
  onRemoveItem,
  onSetPurchaseQuantity,
  onReleaseGrant,
  onRemovePurchase,
  onApplyMagicItemAcquisition,
  open,
  onOpenChange,
}: EquipmentAddedInventoryRowItemProps) {
  const sourceKinds = resolveDistinctAcquisitionSourceKinds(entry.rows)
  const grantQty = grantedQuantity(entry.rows)

  if (!usesInlineManagement({ sourceKinds, grantedQuantity: grantQty })) {
    if (sourceKinds.length === 1 && sourceKinds[0] === 'magicItemGrant' && grantQty === 1) {
      return <GrantOnlySingleReleaseRow entry={entry} onReleaseGrant={onReleaseGrant} />
    }

    const display = groupEquipmentInventoryRowsForDisplay(entry.rows, {
      allowCombinedRows: true,
    })[0]
    if (!display) return null

    return (
      <EquipmentInventoryRowItem
        display={display}
        detailLabelOverride={entry.provenanceLabel}
        onRemoveItem={onRemoveItem}
        onSetPurchaseQuantity={onSetPurchaseQuantity}
      />
    )
  }

  return (
    <ManagedInventoryRow
      entry={entry}
      totalQuantity={entry.totalQuantity}
      draft={draft}
      context={context}
      catalogIndex={catalogIndex}
      budget={budget}
      onReleaseGrant={onReleaseGrant}
      onRemovePurchase={onRemovePurchase}
      onApplyMagicItemAcquisition={onApplyMagicItemAcquisition}
      open={open}
      onOpenChange={onOpenChange}
    />
  )
}
