'use client'

import type { ReactNode } from 'react'

import { Badge, Text } from '@rpg/ui'

import {
  type EquipmentInventoryQuantityTarget,
  type EquipmentInventoryRemoveTarget,
  type EquipmentInventoryRow,
} from '../../lib/equipment-step.lib'
import type { EquipmentInventoryDisplayItem } from './equipment-inventory-summary.lib'
import {
  EQUIPMENT_INVENTORY_REMOVE_VISIBLE_LABEL,
  EquipmentInventoryQuantityControl,
} from './equipment-inventory-quantity-control.client'
import {
  equipmentInventoryRowActionsClasses,
  equipmentInventoryRowClasses,
  equipmentInventoryRowDetailLineClasses,
  equipmentInventoryRowNameClasses,
  equipmentInventoryRowPriceLineClasses,
  equipmentInventoryRowQtyLabelClasses,
  equipmentInventoryRowRemoveTextClasses,
} from './equipment-inventory-summary.variants'
import { builderInventoryRowMetaClasses } from '../builder/builder-inventory-row.variants'

export type EquipmentInventoryRowProps = {
  display: EquipmentInventoryDisplayItem
  onRemoveItem?: (target: EquipmentInventoryRemoveTarget) => void
  onSetPurchaseQuantity?: (target: EquipmentInventoryQuantityTarget, quantity: number) => void
}

function resolveDetailLineLabel(row: EquipmentInventoryRow): string | undefined {
  if (row.priceLineLabel) return row.priceLineLabel
  if (row.bundleLabel) return `${row.sourceLabel} · ${row.bundleLabel}`
  return row.sourceLabel
}

function resolveCombinedDetailLineLabel(
  display: Extract<EquipmentInventoryDisplayItem, { kind: 'combined' }>,
) {
  if (display.bundleLabel) return `${display.breakdownLabel} · ${display.bundleLabel}`
  return display.breakdownLabel
}

function canRemovePurchaseRow(
  row: EquipmentInventoryRow,
  onRemoveItem?: (target: EquipmentInventoryRemoveTarget) => void,
): row is EquipmentInventoryRow & { removeTarget: EquipmentInventoryRemoveTarget } {
  return row.removeTarget?.kind === 'purchase' && onRemoveItem !== undefined
}

function InventoryRemoveTextButton({
  removeLabel,
  onRemove,
}: {
  removeLabel: string
  onRemove: () => void
}) {
  return (
    <button
      type="button"
      className={equipmentInventoryRowRemoveTextClasses}
      aria-label={removeLabel}
      onClick={onRemove}
    >
      {EQUIPMENT_INVENTORY_REMOVE_VISIBLE_LABEL}
    </button>
  )
}

function InventoryRowActions({
  row,
  onRemoveItem,
  onSetPurchaseQuantity,
}: {
  row: EquipmentInventoryRow
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
          onSetPurchaseQuantity={onSetPurchaseQuantity}
        />
      ) : null}
      {showQtyLabel ? (
        <Text as="span" className={equipmentInventoryRowQtyLabelClasses}>
          Qty {row.entry.quantity}
        </Text>
      ) : null}
      {showRemove ? (
        <InventoryRemoveTextButton
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
}: {
  equipmentName: string
  equipped: boolean
}) {
  return (
    <div className={builderInventoryRowMetaClasses}>
      <Text as="p" className={equipmentInventoryRowNameClasses}>
        {equipmentName}
      </Text>
      {equipped ? (
        <Badge variant="secondary" size="sm">
          Equipped
        </Badge>
      ) : null}
    </div>
  )
}

function InventoryRowDetailLine({ label, actions }: { label?: string; actions?: ReactNode }) {
  if (!label && !actions) return null

  return (
    <div className={equipmentInventoryRowDetailLineClasses}>
      {label ? (
        <Text as="p" variant="caption" className={equipmentInventoryRowPriceLineClasses}>
          {label}
        </Text>
      ) : (
        <span />
      )}
      {actions}
    </div>
  )
}

export function EquipmentInventoryRowItem({
  display,
  onRemoveItem,
  onSetPurchaseQuantity,
}: EquipmentInventoryRowProps) {
  if (display.kind === 'single') {
    const { row } = display
    const detailLabel = resolveDetailLineLabel(row)
    const actions = (
      <InventoryRowActions
        row={row}
        onRemoveItem={onRemoveItem}
        onSetPurchaseQuantity={onSetPurchaseQuantity}
      />
    )

    return (
      <article className={equipmentInventoryRowClasses}>
        <InventoryRowHeader
          equipmentName={row.equipmentName}
          equipped={Boolean(row.entry.equipped)}
        />
        <InventoryRowDetailLine label={detailLabel} actions={actions} />
      </article>
    )
  }

  const editableRow = display.rows.find(
    (row) => row.quantityMode === 'editable' && row.quantityTarget !== undefined,
  )
  const removablePurchaseRow = display.rows.find((row) => canRemovePurchaseRow(row, onRemoveItem))
  const equipped = display.rows.some((row) => row.entry.equipped)
  const detailLabel = resolveCombinedDetailLineLabel(display)
  const actionsRow = editableRow ?? removablePurchaseRow

  return (
    <article className={equipmentInventoryRowClasses}>
      <InventoryRowHeader equipmentName={display.equipmentName} equipped={equipped} />
      <InventoryRowDetailLine
        label={detailLabel}
        actions={
          actionsRow ? (
            <InventoryRowActions
              row={actionsRow}
              onRemoveItem={onRemoveItem}
              onSetPurchaseQuantity={onSetPurchaseQuantity}
            />
          ) : undefined
        }
      />
    </article>
  )
}
