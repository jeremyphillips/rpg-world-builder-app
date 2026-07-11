'use client'

import { Trash2 } from 'lucide-react'

import { Badge, Text } from '@rpg/ui'

import { BuilderInventoryRow } from '../builder/builder-inventory-row.client'
import {
  type EquipmentInventoryQuantityTarget,
  type EquipmentInventoryRemoveTarget,
  type EquipmentInventoryRow,
} from '../../lib/equipment-step.lib'
import type { EquipmentInventoryDisplayItem } from './equipment-inventory-summary.lib'
import { EquipmentInventoryQuantityControl } from './equipment-inventory-quantity-control.client'
import {
  equipmentInventoryRowFooterClasses,
  equipmentInventoryRowNameClasses,
  equipmentInventoryRowRemoveButtonClasses,
  equipmentInventoryRowTotalClasses,
} from './equipment-inventory-summary.variants'

export type EquipmentInventoryRowProps = {
  display: EquipmentInventoryDisplayItem
  onRemoveItem?: (target: EquipmentInventoryRemoveTarget) => void
  onSetPurchaseQuantity?: (target: EquipmentInventoryQuantityTarget, quantity: number) => void
}

function formatProvenanceLine(row: EquipmentInventoryRow): string {
  if (row.unitPriceLabel) {
    return `${row.sourceLabel} · ${row.unitPriceLabel}`
  }
  return row.sourceLabel
}

function ProvenanceLines({ lines }: { lines: Array<string | undefined> }) {
  const resolved = lines.filter((line): line is string => Boolean(line))
  if (resolved.length === 0) return null

  return (
    <>
      {resolved.map((line) => (
        <Text key={line} as="p" variant="caption">
          {line}
        </Text>
      ))}
    </>
  )
}

function InventoryRemoveButton({
  removeLabel,
  onRemove,
}: {
  removeLabel: string
  onRemove: () => void
}) {
  // TODO(equipment-quantity): Add undo toast when dashboard gains toast infra; removals are immediate today.
  return (
    <button
      type="button"
      className={equipmentInventoryRowRemoveButtonClasses}
      aria-label={removeLabel}
      onClick={onRemove}
    >
      <Trash2 aria-hidden className="size-4" />
    </button>
  )
}

function QuantityFooter({
  row,
  onSetPurchaseQuantity,
}: {
  row: EquipmentInventoryRow
  onSetPurchaseQuantity?: (target: EquipmentInventoryQuantityTarget, quantity: number) => void
}) {
  return (
    <div className={equipmentInventoryRowFooterClasses}>
      <EquipmentInventoryQuantityControl row={row} onSetPurchaseQuantity={onSetPurchaseQuantity} />
      {row.totalPriceLabel ? (
        <Text as="span" className={equipmentInventoryRowTotalClasses}>
          {row.totalPriceLabel} total
        </Text>
      ) : null}
    </div>
  )
}

function InventoryRemoveActions({
  rows,
  onRemoveItem,
}: {
  rows: EquipmentInventoryRow[]
  onRemoveItem?: (target: EquipmentInventoryRemoveTarget) => void
}) {
  const removableRows = rows.filter((row) => row.removeTarget && onRemoveItem)
  if (removableRows.length === 0) return null

  return (
    <div className="flex items-center gap-1">
      {removableRows.map((row) => (
        <InventoryRemoveButton
          key={row.removeLabel}
          removeLabel={row.removeLabel}
          onRemove={() => onRemoveItem!(row.removeTarget!)}
        />
      ))}
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
    const showQuantityControls = row.quantityMode === 'editable' && row.quantityTarget !== undefined

    return (
      <BuilderInventoryRow
        variant="dense"
        label={
          <Text as="p" className={equipmentInventoryRowNameClasses}>
            {row.equipmentName}
          </Text>
        }
        itemLabel={row.equipmentName}
        meta={
          row.entry.equipped ? (
            <Badge variant="secondary" size="sm">
              Equipped
            </Badge>
          ) : undefined
        }
        provenance={<ProvenanceLines lines={[formatProvenanceLine(row), row.bundleLabel]} />}
        footer={
          showQuantityControls ? (
            <QuantityFooter row={row} onSetPurchaseQuantity={onSetPurchaseQuantity} />
          ) : undefined
        }
        removeAriaLabel={row.removeLabel}
        onRemove={
          row.removeTarget && onRemoveItem ? () => onRemoveItem(row.removeTarget!) : undefined
        }
      />
    )
  }

  const editableRow = display.rows.find(
    (row) => row.quantityMode === 'editable' && row.quantityTarget !== undefined,
  )
  const equipped = display.rows.some((row) => row.entry.equipped)

  return (
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0 flex-1">
        <BuilderInventoryRow
          variant="dense"
          label={
            <Text as="p" className={equipmentInventoryRowNameClasses}>
              {display.equipmentName}
            </Text>
          }
          itemLabel={display.equipmentName}
          meta={
            equipped ? (
              <Badge variant="secondary" size="sm">
                Equipped
              </Badge>
            ) : undefined
          }
          provenance={<ProvenanceLines lines={[display.breakdownLabel, display.bundleLabel]} />}
          footer={
            editableRow ? (
              <QuantityFooter row={editableRow} onSetPurchaseQuantity={onSetPurchaseQuantity} />
            ) : undefined
          }
        />
      </div>
      <InventoryRemoveActions rows={display.rows} onRemoveItem={onRemoveItem} />
    </div>
  )
}
