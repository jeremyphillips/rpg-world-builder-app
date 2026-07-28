'use client'

import type { ReactNode } from 'react'
import { Trash2 } from 'lucide-react'

import { Badge, Text } from '@rpg/ui'

import {
  type EquipmentInventoryQuantityTarget,
  type EquipmentInventoryRemoveTarget,
  type EquipmentInventoryRow,
} from '../../lib/equipment/equipment-step.lib'
import {
  resolveCombinedInventoryDetailLineLabel,
  type EquipmentInventoryDisplayItem,
} from './equipment-inventory-summary.lib'
import { EquipmentInventoryQuantityControl } from './equipment-inventory-quantity-control.client'
import {
  equipmentInventoryRowActionsClasses,
  equipmentInventoryRowClasses,
  equipmentInventoryRowDetailLineClasses,
  equipmentInventoryRowHeaderClasses,
  equipmentInventoryRowNameClasses,
  equipmentInventoryRowPriceLineClasses,
  equipmentInventoryRowQtyLabelClasses,
  equipmentInventoryRowRemoveButtonClasses,
  equipmentInventoryRowStagedRemovalNameClasses,
} from './equipment-inventory-summary.variants'
import { builderInventoryRowMetaClasses } from '../builder/builder-inventory-row.variants'

export type EquipmentInventoryRowProps = {
  display: EquipmentInventoryDisplayItem
  allowZeroQuantity?: boolean
  detailLabelOverride?: string
  onRemoveItem?: (target: EquipmentInventoryRemoveTarget) => void
  onSetPurchaseQuantity?: (target: EquipmentInventoryQuantityTarget, quantity: number) => void
}

function resolveDetailLineLabel(row: EquipmentInventoryRow): string | undefined {
  if (row.stagedRemoval) return row.sourceLabel
  if (row.priceLineLabel) return row.priceLineLabel
  if (row.bundleLabel) return `${row.sourceLabel} · ${row.bundleLabel}`
  return row.sourceLabel
}

function canRemovePurchaseRow(
  row: EquipmentInventoryRow,
  onRemoveItem?: (target: EquipmentInventoryRemoveTarget) => void,
): row is EquipmentInventoryRow & { removeTarget: EquipmentInventoryRemoveTarget } {
  return row.removeTarget?.kind === 'purchase' && onRemoveItem !== undefined
}

function InventoryRemoveIconButton({
  removeLabel,
  onRemove,
}: {
  removeLabel: string
  onRemove: () => void
}) {
  return (
    <button
      type="button"
      className={equipmentInventoryRowRemoveButtonClasses}
      aria-label={removeLabel}
      onClick={onRemove}
    >
      <Trash2 aria-hidden className="size-3" />
    </button>
  )
}

function InventoryRowActions({
  row,
  allowZeroQuantity = false,
  onRemoveItem,
  onSetPurchaseQuantity,
}: {
  row: EquipmentInventoryRow
  allowZeroQuantity?: boolean
  onRemoveItem?: (target: EquipmentInventoryRemoveTarget) => void
  onSetPurchaseQuantity?: (target: EquipmentInventoryQuantityTarget, quantity: number) => void
}) {
  const showStepper = row.quantityMode === 'editable' && row.quantityTarget !== undefined
  const showQtyLabel = row.quantityMode === 'locked' && row.entry.quantity > 1
  const showRemove = canRemovePurchaseRow(row, onRemoveItem)

  if (!showStepper && !showQtyLabel && !showRemove) return null

  return (
    <div className={equipmentInventoryRowActionsClasses}>
      {showStepper ? (
        <EquipmentInventoryQuantityControl
          row={row}
          allowZeroQuantity={allowZeroQuantity}
          onSetPurchaseQuantity={onSetPurchaseQuantity}
        />
      ) : null}
      {showQtyLabel ? (
        <Text as="span" className={equipmentInventoryRowQtyLabelClasses}>
          Qty {row.entry.quantity}
        </Text>
      ) : null}
      {showRemove ? (
        <InventoryRemoveIconButton
          removeLabel={row.removeLabel}
          onRemove={() => onRemoveItem!(row.removeTarget)}
        />
      ) : null}
    </div>
  )
}

function InventoryRowHeader({
  equipmentName,
  equipped,
  stagedRemoval = false,
  actions,
}: {
  equipmentName: string
  equipped: boolean
  stagedRemoval?: boolean
  actions?: ReactNode
}) {
  return (
    <div className={equipmentInventoryRowHeaderClasses}>
      <div className={builderInventoryRowMetaClasses}>
        <Text
          as="p"
          className={
            stagedRemoval
              ? equipmentInventoryRowStagedRemovalNameClasses
              : equipmentInventoryRowNameClasses
          }
        >
          {equipmentName}
        </Text>
        {equipped ? (
          <Badge appearance="soft" tone="success" size="sm">
            Equipped
          </Badge>
        ) : null}
      </div>
      {actions}
    </div>
  )
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

export function EquipmentInventoryRowItem({
  display,
  allowZeroQuantity = false,
  detailLabelOverride,
  onRemoveItem,
  onSetPurchaseQuantity,
}: EquipmentInventoryRowProps) {
  if (display.kind === 'single') {
    const { row } = display
    const detailLabel = detailLabelOverride ?? resolveDetailLineLabel(row)
    const actions = (
      <InventoryRowActions
        row={row}
        allowZeroQuantity={allowZeroQuantity}
        onRemoveItem={onRemoveItem}
        onSetPurchaseQuantity={onSetPurchaseQuantity}
      />
    )

    return (
      <article className={equipmentInventoryRowClasses}>
        <InventoryRowHeader
          equipmentName={row.equipmentName}
          equipped={Boolean(row.entry.equipped)}
          stagedRemoval={row.stagedRemoval}
          actions={actions}
        />
        <InventoryRowDetailLine label={detailLabel} />
      </article>
    )
  }

  const editableRow = display.rows.find(
    (row) => row.quantityMode === 'editable' && row.quantityTarget !== undefined,
  )
  const removablePurchaseRow = display.rows.find((row) => canRemovePurchaseRow(row, onRemoveItem))
  const equipped = display.rows.some((row) => row.entry.equipped)
  const detailLabel = detailLabelOverride ?? resolveCombinedInventoryDetailLineLabel(display)
  const actionsRow = editableRow ?? removablePurchaseRow

  return (
    <article className={equipmentInventoryRowClasses}>
      <InventoryRowHeader
        equipmentName={display.equipmentName}
        equipped={equipped}
        actions={
          actionsRow ? (
            <InventoryRowActions
              row={actionsRow}
              allowZeroQuantity={allowZeroQuantity}
              onRemoveItem={onRemoveItem}
              onSetPurchaseQuantity={onSetPurchaseQuantity}
            />
          ) : undefined
        }
      />
      <InventoryRowDetailLine label={detailLabel} />
    </article>
  )
}
