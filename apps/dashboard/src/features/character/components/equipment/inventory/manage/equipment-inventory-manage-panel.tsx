import { useCallback } from 'react'

import type {
  CharacterBuildCatalogIndex,
  CharacterBuildContext,
  CharacterBuilderDraft,
  Equipment,
  EquipmentBudgetSummary,
} from '@rpg/contracts'

import { DisclosureEntityCard, type EntitySummaryStatusItem } from '@/features/content'
import { type EquipmentInventoryRow } from '../../../../lib/equipment/equipment-step.lib'
import type { AddedEquipmentEntryViewModel } from '../../../../lib/equipment/equipment-inventory-summary.lib'
import type { EquipmentOwnedSourceAction } from '../../acquisition/equipment-acquisition-panel.lib'
import { EquipmentAcquisitionPanelBody } from '../../acquisition/equipment-acquisition-panel-body'
import { buildEquipmentInventoryRowEntity } from '../equipment-inventory-entity.lib'
import { useEquipmentAcquisitionQuantityCommit } from '../../../../hooks/use-equipment-acquisition-quantity-commit'

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
  /** Resolved by the parent section with its selection-row context. */
  status?: readonly EntitySummaryStatusItem[]
  provenanceLabel?: string
  itemId: string
  collapsed?: boolean
  onToggleCollapse?: () => void
  defaultCollapsed?: boolean
}

export function EquipmentInventoryManageDisclosureCard({
  equipmentName,
  status,
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
      entity={buildEquipmentInventoryRowEntity({ equipmentName, status })}
      trailing={
        provenanceLabel
          ? { kind: 'indicator', variant: 'label', label: provenanceLabel }
          : undefined
      }
      collapsed={collapsed}
      onToggleCollapse={onToggleCollapse}
      defaultCollapsed={defaultCollapsed}
      density="compact"
    >
      <EquipmentInventoryManagePanelBody equipment={equipment} rows={rows} {...bodyProps} />
    </DisclosureEntityCard>
  )
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
