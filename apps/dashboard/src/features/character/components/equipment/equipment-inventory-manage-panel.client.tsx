'use client'

import { useCallback, useId } from 'react'

import type {
  CharacterBuildCatalogIndex,
  CharacterBuildContext,
  CharacterBuilderDraft,
  Equipment,
  EquipmentBudgetSummary,
} from '@rpg/contracts'
import {
  applyEquipmentStepAction,
  resolveEquipmentAcquisitionBuilderContext,
  standardStartingWealthTableId,
} from '@rpg/contracts'
import { Button, Collapsible, CollapsibleContent, CollapsibleTrigger } from '@rpg/ui'

import {
  EQUIPMENT_INVENTORY_MANAGE_LABEL,
  type EquipmentInventoryRow,
} from '../../lib/equipment-step.lib'
import type { AddedEquipmentEntryViewModel } from './equipment-inventory-summary.lib'
import type { EquipmentOwnedSourceAction } from './equipment-acquisition-panel.lib'
import { EquipmentAcquisitionPanelBody } from './equipment-acquisition-panel-body.client'
import {
  equipmentInventoryManagePanelContentClasses,
  equipmentInventoryManagePanelRootClasses,
} from './equipment-inventory-manage-panel.variants'
import { useEquipmentAcquisitionQuantityCommit } from './use-equipment-acquisition-quantity-commit.client'

export type EquipmentInventoryManagePanelBodyProps = {
  equipment: Equipment
  rows: readonly EquipmentInventoryRow[]
  draft: CharacterBuilderDraft
  context: CharacterBuildContext
  catalogIndex: CharacterBuildCatalogIndex
  budget?: EquipmentBudgetSummary
  onReleaseGrant: (args: { allowanceId: string; equipmentId: string; quantity: number }) => void
  onRemovePurchase: (args: { purchaseId: string; quantity: number }) => void
  onApplyMagicItemAcquisition: (args: { equipmentId: string; requestedQuantity: number }) => boolean
}

export function EquipmentInventoryManagePanelBody({
  equipment,
  rows,
  draft,
  context,
  catalogIndex,
  budget,
  onReleaseGrant,
  onRemovePurchase,
  onApplyMagicItemAcquisition,
}: EquipmentInventoryManagePanelBodyProps) {
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
    <EquipmentAcquisitionPanelBody
      draft={draft}
      context={context}
      catalogIndex={catalogIndex}
      equipment={equipment}
      rows={rows}
      budget={budget}
      quantity={quantity}
      onQuantityChange={setQuantity}
      isPending={isPending}
      successQuantity={successQuantity}
      onSourceAction={handleSourceAction}
      onCommit={commitQuantity}
      layout="disclosure"
    />
  )
}

export type EquipmentInventoryManagePanelProps = EquipmentInventoryManagePanelBodyProps & {
  equipmentName: string
}

export function EquipmentInventoryManagePanel({
  equipmentName: _equipmentName,
  ...props
}: EquipmentInventoryManagePanelProps) {
  const contentId = useId()

  return (
    <Collapsible className={equipmentInventoryManagePanelRootClasses}>
      <CollapsibleTrigger asChild>
        <Button type="button" size="sm" variant="secondary">
          {EQUIPMENT_INVENTORY_MANAGE_LABEL}
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent id={contentId} className={equipmentInventoryManagePanelContentClasses}>
        <EquipmentInventoryManagePanelBody {...props} />
      </CollapsibleContent>
    </Collapsible>
  )
}

export type EquipmentInventoryManageEntryProps = Omit<
  EquipmentInventoryManagePanelProps,
  'equipment' | 'rows'
> & {
  entry: AddedEquipmentEntryViewModel
}

export function EquipmentInventoryManageEntryPanel({
  entry,
  ...props
}: EquipmentInventoryManageEntryProps) {
  const equipment = entry.rows.find((row) => row.equipment)?.equipment
  if (!equipment) return null

  return <EquipmentInventoryManagePanel equipment={equipment} rows={entry.rows} {...props} />
}

export function createStorybookApplyMagicItemAcquisition(args: {
  draft: CharacterBuilderDraft
  context: CharacterBuildContext
  catalogIndex: CharacterBuildCatalogIndex
  onDraftChange?: (patch: Partial<CharacterBuilderDraft>) => void
}) {
  return ({
    equipmentId,
    requestedQuantity,
  }: {
    equipmentId: string
    requestedQuantity: number
  }) => {
    const result = applyEquipmentStepAction({
      draft: args.draft,
      catalogIndex: args.catalogIndex,
      acquisitionContext: resolveEquipmentAcquisitionBuilderContext({
        context: args.context,
        catalogIndex: args.catalogIndex,
        startingWealthTableId: standardStartingWealthTableId(args.context.rulesetId),
      }),
      action: { kind: 'acquire_magic_item', equipmentId, requestedQuantity },
    })
    if (result.status !== 'applied') return false
    args.onDraftChange?.(result.patch)
    return true
  }
}
