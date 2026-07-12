'use client'

import { NumberStepper } from '@rpg/ui'

import {
  clampEquipmentStepQuantity,
  EQUIPMENT_PURCHASE_QUANTITY_MAX,
  EQUIPMENT_STEP_QUANTITY_INPUT_DIGITS,
} from '../../lib/equipment-quantity.lib'
import {
  type EquipmentInventoryQuantityTarget,
  type EquipmentInventoryRow,
} from '../../lib/equipment-step.lib'
import { equipmentInventoryRowQuantityClasses } from './equipment-inventory-summary.variants'

export type EquipmentInventoryQuantityControlProps = {
  row: EquipmentInventoryRow
  onSetPurchaseQuantity?: (target: EquipmentInventoryQuantityTarget, quantity: number) => void
}

export function EquipmentInventoryQuantityControl({
  row,
  onSetPurchaseQuantity,
}: EquipmentInventoryQuantityControlProps) {
  const maxQuantity = row.maxQuantity ?? EQUIPMENT_PURCHASE_QUANTITY_MAX

  return (
    <div className={equipmentInventoryRowQuantityClasses}>
      <NumberStepper
        aria-label={`Quantity for ${row.equipmentName}`}
        size="sm"
        bordered={true}
        digits={EQUIPMENT_STEP_QUANTITY_INPUT_DIGITS}
        min={1}
        max={maxQuantity}
        value={row.entry.quantity}
        disabled={!onSetPurchaseQuantity}
        onChange={(next) => {
          if (!row.quantityTarget || !onSetPurchaseQuantity) return
          onSetPurchaseQuantity(row.quantityTarget, clampEquipmentStepQuantity(next, maxQuantity))
        }}
      />
    </div>
  )
}
