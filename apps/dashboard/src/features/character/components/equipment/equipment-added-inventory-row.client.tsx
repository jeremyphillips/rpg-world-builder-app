'use client'

import { useCallback, useId, useState } from 'react'

import { ChevronDown, ChevronUp } from 'lucide-react'

import type {
  CharacterBuildCatalogIndex,
  CharacterBuildContext,
  CharacterBuilderDraft,
  EquipmentBudgetSummary,
} from '@rpg/contracts'
import { Button, Collapsible, CollapsibleContent, CollapsibleTrigger, Text } from '@rpg/ui'

import {
  EQUIPMENT_INVENTORY_DONE_LABEL,
  EQUIPMENT_INVENTORY_MANAGE_LABEL,
  EQUIPMENT_INVENTORY_RELEASE_LABEL,
  type EquipmentInventoryQuantityTarget,
  type EquipmentInventoryRemoveTarget,
} from '../../lib/equipment-step.lib'
import type { EquipmentOwnedSourceAction } from './equipment-acquisition-panel.lib'
import { EquipmentAcquisitionPanelBody } from './equipment-acquisition-panel-body.client'
import { equipmentInventoryDisclosureTriggerClasses } from './equipment-acquisition-panel.variants'
import {
  groupEquipmentInventoryRowsForDisplay,
  type AddedEquipmentEntryViewModel,
} from './equipment-inventory-summary.lib'
import { EquipmentInventoryRowItem } from './equipment-inventory-row.client'
import {
  grantedQuantity,
  resolveDistinctAcquisitionSourceKinds,
  usesInlineManagement,
} from './equipment-inventory-manage.lib'
import { equipmentInventoryManageRowClasses } from './equipment-inventory-manage-panel.variants'
import {
  equipmentInventoryRowActionsClasses,
  equipmentInventoryRowClasses,
  equipmentInventoryRowDetailLineClasses,
  equipmentInventoryRowHeaderClasses,
  equipmentInventoryRowNameClasses,
  equipmentInventoryRowPriceLineClasses,
  equipmentInventoryRowQtyLabelClasses,
} from './equipment-inventory-summary.variants'
import { builderInventoryRowMetaClasses } from '../builder/builder-inventory-row.variants'
import { useEquipmentAcquisitionQuantityCommit } from './use-equipment-acquisition-quantity-commit.client'

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

function InventoryRowDetailLine({ label }: { label?: string }) {
  if (!label) return null

  return (
    <div className={equipmentInventoryRowDetailLineClasses}>
      <Text as="p" variant="caption" className={equipmentInventoryRowPriceLineClasses}>
        {label}
      </Text>
    </div>
  )
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
    <article className={equipmentInventoryRowClasses}>
      <div className={equipmentInventoryRowHeaderClasses}>
        <div className={builderInventoryRowMetaClasses}>
          <Text as="p" className={equipmentInventoryRowNameClasses}>
            {entry.equipmentName}
          </Text>
        </div>
        <div className={equipmentInventoryRowActionsClasses}>
          <Button
            type="button"
            size="sm"
            variant="secondary"
            onClick={() =>
              onReleaseGrant({
                allowanceId: removeTarget.allowanceId,
                equipmentId: removeTarget.equipmentId,
                quantity: 1,
              })
            }
          >
            {EQUIPMENT_INVENTORY_RELEASE_LABEL}
          </Button>
        </div>
      </div>
      <InventoryRowDetailLine label={entry.provenanceLabel} />
    </article>
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
  const contentId = useId()
  const [internalOpen, setInternalOpen] = useState(false)
  const isOpen = open ?? internalOpen
  const equipment = entry.rows.find((row) => row.equipment)?.equipment
  if (!equipment) return null

  const handleOpenChange = useCallback(
    (next: boolean) => {
      if (onOpenChange) onOpenChange(next)
      else setInternalOpen(next)
    },
    [onOpenChange],
  )

  const commitAcquisition = useCallback(
    (requestedQuantity: number) =>
      onApplyMagicItemAcquisition({ equipmentId: equipment.id, requestedQuantity }),
    [equipment.id, onApplyMagicItemAcquisition],
  )

  const { quantity, setQuantity, isPending, successQuantity, commitQuantity } =
    useEquipmentAcquisitionQuantityCommit({ commit: commitAcquisition })

  const handleSourceAction = useCallback(
    (action: EquipmentOwnedSourceAction) => {
      if (action.target.kind === 'magicItemGrant') {
        onReleaseGrant({
          allowanceId: action.target.allowanceId,
          equipmentId: action.target.equipmentId,
          quantity: action.quantity,
        })
        return
      }

      onRemovePurchase({
        purchaseId: action.target.purchaseId,
        quantity: action.quantity,
      })
    },
    [onReleaseGrant, onRemovePurchase],
  )

  return (
    <article className={equipmentInventoryRowClasses}>
      <Collapsible
        className={equipmentInventoryManageRowClasses}
        open={isOpen}
        onOpenChange={handleOpenChange}
      >
        <div className={equipmentInventoryRowHeaderClasses}>
          <div className={builderInventoryRowMetaClasses}>
            <Text as="p" className={equipmentInventoryRowNameClasses}>
              {entry.equipmentName}
            </Text>
          </div>
          <div className={equipmentInventoryRowActionsClasses}>
            <Text as="span" className={equipmentInventoryRowQtyLabelClasses}>
              Qty {totalQuantity}
            </Text>
            <CollapsibleTrigger asChild>
              <button
                type="button"
                className={equipmentInventoryDisclosureTriggerClasses}
                aria-controls={contentId}
              >
                {isOpen ? EQUIPMENT_INVENTORY_DONE_LABEL : EQUIPMENT_INVENTORY_MANAGE_LABEL}
                {isOpen ? (
                  <ChevronUp aria-hidden className="size-3.5" />
                ) : (
                  <ChevronDown aria-hidden className="size-3.5" />
                )}
              </button>
            </CollapsibleTrigger>
          </div>
        </div>
        <InventoryRowDetailLine label={entry.provenanceLabel} />
        <CollapsibleContent id={contentId}>
          <EquipmentAcquisitionPanelBody
            draft={draft}
            context={context}
            catalogIndex={catalogIndex}
            equipment={equipment}
            rows={entry.rows}
            budget={budget}
            quantity={quantity}
            onQuantityChange={setQuantity}
            isPending={isPending}
            successQuantity={successQuantity}
            onSourceAction={handleSourceAction}
            onCommit={commitQuantity}
          />
        </CollapsibleContent>
      </Collapsible>
    </article>
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
