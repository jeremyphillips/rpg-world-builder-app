'use client'

import type {
  CharacterBuildCatalogIndex,
  CharacterBuildContext,
  CharacterBuilderDraft,
  EquipmentBudgetSummary,
} from '@rpg/contracts'
import { Button, Text } from '@rpg/ui'

import {
  EQUIPMENT_INVENTORY_RELEASE_LABEL,
  type EquipmentInventoryQuantityTarget,
  type EquipmentInventoryRemoveTarget,
} from '../../lib/equipment-step.lib'
import { EquipmentInventoryManageEntryPanel } from './equipment-inventory-manage-panel.client'
import {
  groupEquipmentInventoryRowsForDisplay,
  type AddedEquipmentEntryViewModel,
} from './equipment-inventory-summary.lib'
import { EquipmentInventoryRowItem } from './equipment-inventory-row.client'
import { resolveEquipmentInventoryRowManagementMode } from './equipment-inventory-manage.lib'
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
  onAddAnother: (equipmentId: string) => void
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
  mode,
  draft,
  context,
  catalogIndex,
  budget,
  onReleaseGrant,
  onRemovePurchase,
  onAddAnother,
}: {
  entry: AddedEquipmentEntryViewModel
  mode: Extract<
    ReturnType<typeof resolveEquipmentInventoryRowManagementMode>,
    { kind: 'grant_only' | 'mixed' }
  >
  draft: CharacterBuilderDraft
  context: CharacterBuildContext
  catalogIndex: CharacterBuildCatalogIndex
  budget?: EquipmentBudgetSummary
  onReleaseGrant: EquipmentAddedInventoryRowItemProps['onReleaseGrant']
  onRemovePurchase: EquipmentAddedInventoryRowItemProps['onRemovePurchase']
  onAddAnother: EquipmentAddedInventoryRowItemProps['onAddAnother']
}) {
  const showQuantity = mode.kind === 'mixed' || mode.totalQuantity > 1

  return (
    <article className={equipmentInventoryRowClasses}>
      <div className={equipmentInventoryRowHeaderClasses}>
        <div className={builderInventoryRowMetaClasses}>
          <Text as="p" className={equipmentInventoryRowNameClasses}>
            {entry.equipmentName}
          </Text>
        </div>
        <div className={equipmentInventoryRowActionsClasses}>
          {showQuantity ? (
            <Text as="span" className={equipmentInventoryRowQtyLabelClasses}>
              Qty {mode.totalQuantity}
            </Text>
          ) : null}
          <EquipmentInventoryManageEntryPanel
            entry={entry}
            draft={draft}
            context={context}
            catalogIndex={catalogIndex}
            budget={budget}
            showAddAnother={mode.kind === 'mixed' || mode.kind === 'grant_only'}
            onReleaseGrant={onReleaseGrant}
            onRemovePurchase={onRemovePurchase}
            onAddAnother={onAddAnother}
          />
        </div>
      </div>
      <InventoryRowDetailLine label={entry.provenanceLabel} />
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
  onAddAnother,
}: EquipmentAddedInventoryRowItemProps) {
  const mode = resolveEquipmentInventoryRowManagementMode(entry.rows)

  if (mode.kind === 'purchase_only') {
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

  if (mode.kind === 'grant_only' && mode.totalQuantity === 1) {
    return <GrantOnlySingleReleaseRow entry={entry} onReleaseGrant={onReleaseGrant} />
  }

  return (
    <ManagedInventoryRow
      entry={entry}
      mode={mode}
      draft={draft}
      context={context}
      catalogIndex={catalogIndex}
      budget={budget}
      onReleaseGrant={onReleaseGrant}
      onRemovePurchase={onRemovePurchase}
      onAddAnother={onAddAnother}
    />
  )
}
