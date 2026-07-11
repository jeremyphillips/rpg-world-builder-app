'use client'

import { useState } from 'react'

import { NumberInput } from '@rpg/ui'

import {
  clampEquipmentStepQuantity,
  EQUIPMENT_PURCHASE_QUANTITY_MAX,
  EQUIPMENT_STEP_QUANTITY_INPUT_DIGITS,
} from '../../lib/equipment-quantity.lib'
import {
  EQUIPMENT_INVENTORY_CLICK_TO_EDIT_QUANTITY_THRESHOLD,
  type EquipmentInventoryQuantityTarget,
  type EquipmentInventoryRow,
} from '../../lib/equipment-step.lib'
import { equipmentInventoryRowQuantityClasses } from './equipment-inventory-summary.variants'

export type EquipmentInventoryQuantityControlProps = {
  row: EquipmentInventoryRow
  onSetPurchaseQuantity?: (target: EquipmentInventoryQuantityTarget, quantity: number) => void
}

function prefersClickToEditQuantity(row: EquipmentInventoryRow): boolean {
  return row.entry.quantity >= EQUIPMENT_INVENTORY_CLICK_TO_EDIT_QUANTITY_THRESHOLD
}

export function EquipmentInventoryQuantityControl({
  row,
  onSetPurchaseQuantity,
}: EquipmentInventoryQuantityControlProps) {
  const [isEditing, setIsEditing] = useState(false)
  const clickToEdit = prefersClickToEditQuantity(row)
  const maxQuantity = row.maxQuantity ?? EQUIPMENT_PURCHASE_QUANTITY_MAX

  if (clickToEdit && !isEditing) {
    return (
      <div className={equipmentInventoryRowQuantityClasses}>
        <button
          type="button"
          className="min-w-8 rounded-sm border border-input px-2 py-1 text-xs tabular-nums hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label={`Edit quantity for ${row.equipmentName}`}
          disabled={!onSetPurchaseQuantity}
          onClick={() => setIsEditing(true)}
        >
          {row.entry.quantity}
        </button>
      </div>
    )
  }

  return (
    <div className={equipmentInventoryRowQuantityClasses}>
      <NumberInput
        aria-label={`Quantity for ${row.equipmentName}`}
        size="sm"
        digits={EQUIPMENT_STEP_QUANTITY_INPUT_DIGITS}
        stepperMin={1}
        stepperMax={maxQuantity}
        value={row.entry.quantity}
        disabled={!onSetPurchaseQuantity}
        autoFocus={isEditing}
        onBlur={() => setIsEditing(false)}
        onChange={(event) => {
          if (!row.quantityTarget || !onSetPurchaseQuantity) return
          const next = Number(event.target.value)
          onSetPurchaseQuantity(row.quantityTarget, clampEquipmentStepQuantity(next, maxQuantity))
        }}
      />
    </div>
  )
}
