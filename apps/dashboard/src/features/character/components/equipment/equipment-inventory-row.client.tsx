'use client'

import type { EquipmentBudgetSummary } from '@rpg/contracts'
import { Badge, Button, NumberInput, Text } from '@rpg/ui'

import {
  EQUIPMENT_STEP_REMOVE_ITEM_LABEL,
  resolveMaxAffordablePurchaseQuantity,
  type EquipmentInventoryQuantityTarget,
  type EquipmentInventoryRemoveTarget,
  type EquipmentInventoryRow,
} from '../../lib/equipment-step.lib'
import {
  equipmentInventorySummaryActionsClasses,
  equipmentInventorySummaryQuantityClasses,
  equipmentInventorySummaryRowClasses,
  equipmentInventorySummaryRowMetaClasses,
  equipmentInventorySummarySourceClasses,
} from './equipment-inventory-summary.variants'

export type EquipmentInventoryRowProps = {
  row: EquipmentInventoryRow
  budget?: EquipmentBudgetSummary
  onRemoveItem?: (target: EquipmentInventoryRemoveTarget) => void
  onSetPurchaseQuantity?: (target: EquipmentInventoryQuantityTarget, quantity: number) => void
}

export function EquipmentInventoryRowItem({
  row,
  budget,
  onRemoveItem,
  onSetPurchaseQuantity,
}: EquipmentInventoryRowProps) {
  const maxQuantity =
    row.equipment && budget
      ? resolveMaxAffordablePurchaseQuantity({
          equipment: row.equipment,
          budget,
          currentQuantity: row.entry.quantity,
        })
      : undefined

  return (
    <div className={equipmentInventorySummaryRowClasses}>
      <div className={equipmentInventorySummaryRowMetaClasses}>
        {row.quantityTarget ? (
          <div className={equipmentInventorySummaryQuantityClasses}>
            <NumberInput
              aria-label={`Quantity for ${row.equipmentName}`}
              size="sm"
              digits={2}
              min={1}
              max={maxQuantity}
              value={row.entry.quantity}
              disabled={!onSetPurchaseQuantity}
              onChange={(event) => {
                if (!row.quantityTarget || !onSetPurchaseQuantity) return
                const next = Number(event.target.value)
                if (!Number.isFinite(next) || next < 1) return
                onSetPurchaseQuantity(row.quantityTarget, next)
              }}
            />
            <Text as="span">{row.equipmentName}</Text>
          </div>
        ) : (
          <Text as="span">
            {row.entry.quantity > 1 ? `${row.entry.quantity}× ` : ''}
            {row.equipmentName}
          </Text>
        )}
        {row.entry.equipped ? (
          <Badge variant="secondary" size="sm">
            Equipped
          </Badge>
        ) : null}
      </div>
      <div className={equipmentInventorySummaryActionsClasses}>
        <Text variant="small" className={equipmentInventorySummarySourceClasses}>
          {row.sourceLabel}
        </Text>
        {row.removeTarget && onRemoveItem ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onRemoveItem(row.removeTarget!)}
          >
            {EQUIPMENT_STEP_REMOVE_ITEM_LABEL}
          </Button>
        ) : null}
      </div>
    </div>
  )
}
