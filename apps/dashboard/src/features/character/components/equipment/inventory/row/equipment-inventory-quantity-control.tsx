import { NumberStepper } from '@rpg/ui'

import {
  clampEquipmentStepQuantity,
  EQUIPMENT_PURCHASE_QUANTITY_MAX,
  EQUIPMENT_STEP_QUANTITY_INPUT_DIGITS,
} from '../../../../lib/equipment/equipment-quantity.lib'
import {
  type EquipmentInventoryQuantityTarget,
  type EquipmentInventoryRow,
} from '../../../../lib/equipment/equipment-step.lib'
import { equipmentInventoryRowQuantityClasses } from '../equipment-inventory.variants'

export type EquipmentInventoryQuantityControlProps = {
  row: EquipmentInventoryRow
  allowZeroQuantity?: boolean
  onSetPurchaseQuantity?: (target: EquipmentInventoryQuantityTarget, quantity: number) => void
  onRemove?: () => void
  removeAriaLabel?: string
}

export function EquipmentInventoryQuantityControl({
  row,
  allowZeroQuantity = false,
  onSetPurchaseQuantity,
  onRemove,
  removeAriaLabel,
}: EquipmentInventoryQuantityControlProps) {
  const maxQuantity = row.maxQuantity ?? EQUIPMENT_PURCHASE_QUANTITY_MAX
  const minQuantity = allowZeroQuantity ? 0 : 1
  const minAction =
    onRemove && removeAriaLabel && minQuantity >= 1
      ? ({
          mode: 'remove',
          onRemove,
          removeAriaLabel,
        } as const)
      : undefined

  return (
    <div className={equipmentInventoryRowQuantityClasses}>
      <NumberStepper
        aria-label={`${row.equipmentName} quantity`}
        bordered={true}
        digits={EQUIPMENT_STEP_QUANTITY_INPUT_DIGITS}
        min={minQuantity}
        max={maxQuantity}
        value={row.entry.quantity}
        disabled={!onSetPurchaseQuantity}
        minAction={minAction}
        onChange={(next) => {
          if (!row.quantityTarget || !onSetPurchaseQuantity) return
          const clamped = allowZeroQuantity
            ? Math.min(Math.max(next, 0), maxQuantity)
            : clampEquipmentStepQuantity(next, maxQuantity)
          onSetPurchaseQuantity(row.quantityTarget, clamped)
        }}
      />
    </div>
  )
}
