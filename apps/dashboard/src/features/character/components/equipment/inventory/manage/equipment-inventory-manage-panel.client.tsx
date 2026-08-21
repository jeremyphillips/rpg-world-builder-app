'use client'

import { useCallback } from 'react'

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

import { DisclosureEntityCard } from '@/features/content'
import { type EquipmentInventoryRow } from '../../../../lib/equipment/equipment-step.lib'
import type { AddedEquipmentEntryViewModel } from '../../../../lib/equipment/equipment-inventory-summary.lib'
import type { EquipmentOwnedSourceAction } from '../../acquisition/equipment-acquisition-panel.lib'
import { EquipmentAcquisitionPanelBody } from '../../acquisition/equipment-acquisition-panel-body.client'
import { buildEquipmentInventoryRowEntity } from '../equipment-inventory-entity.lib'
import { useEquipmentAcquisitionQuantityCommit } from '../../../../hooks/use-equipment-acquisition-quantity-commit.client'

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

export type EquipmentInventoryManageDisclosureCardProps = EquipmentInventoryManagePanelBodyProps & {
  equipmentName: string
  provenanceLabel?: string
  itemId: string
  collapsed?: boolean
  onToggleCollapse?: () => void
  defaultCollapsed?: boolean
}

export function EquipmentInventoryManageDisclosureCard({
  equipmentName,
  provenanceLabel,
  itemId,
  collapsed,
  onToggleCollapse,
  defaultCollapsed = true,
  equipment,
  rows,
  ...bodyProps
}: EquipmentInventoryManageDisclosureCardProps) {
  return (
    <DisclosureEntityCard
      itemId={itemId}
      toolbarAriaLabel={equipmentName}
      entity={buildEquipmentInventoryRowEntity({
        equipmentName,
        detailLabel: provenanceLabel,
      })}
      collapsed={collapsed}
      onToggleCollapse={onToggleCollapse}
      defaultCollapsed={defaultCollapsed}
      density="compact"
    >
      <EquipmentInventoryManagePanelBody equipment={equipment} rows={rows} {...bodyProps} />
    </DisclosureEntityCard>
  )
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

export type EquipmentInventoryManageEntryProps = Omit<
  EquipmentInventoryManageDisclosureCardProps,
  'equipment' | 'rows' | 'itemId' | 'equipmentName' | 'provenanceLabel'
> & {
  entry: AddedEquipmentEntryViewModel
}

export function EquipmentInventoryManageEntryCard({
  entry,
  ...props
}: EquipmentInventoryManageEntryProps) {
  const equipment = entry.rows.find((row) => row.equipment)?.equipment
  if (!equipment) return null

  return (
    <EquipmentInventoryManageDisclosureCard
      itemId={entry.equipmentId}
      equipmentName={entry.equipmentName}
      provenanceLabel={entry.provenanceLabel}
      equipment={equipment}
      rows={entry.rows}
      {...props}
    />
  )
}
