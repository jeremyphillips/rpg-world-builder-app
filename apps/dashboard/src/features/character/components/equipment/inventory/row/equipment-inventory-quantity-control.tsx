import {
  clampEquipmentStepQuantity,
  EQUIPMENT_PURCHASE_QUANTITY_MAX,
  EQUIPMENT_STEP_QUANTITY_INPUT_DIGITS,
} from '../../../../lib/equipment/equipment-quantity.lib'
import {
  type EquipmentInventoryQuantityTarget,
  type EquipmentInventoryRow,
} from '../../../../lib/equipment/equipment-step.lib'
import { EquipmentQuantityStepper } from '../../equipment-quantity-stepper'
import { equipmentInventoryRowQuantityClasses } from '../equipment-inventory.variants'

export type EquipmentInventoryQuantityControlProps = {
  row: EquipmentInventoryRow
  allowZeroQuantity?: boolean
  otherSourceQuantity?: number
  onSetPurchaseQuantity?: (target: EquipmentInventoryQuantityTarget, quantity: number) => void
  onRemove?: () => void
  removeAriaLabel?: string
}

function inventoryQuantityAriaLabel(equipmentName: string, otherSourceQuantity: number): string {
  if (otherSourceQuantity <= 0) return `${equipmentName} quantity`
  return `Additional ${equipmentName} purchased, ${otherSourceQuantity} from other sources`
}

export function EquipmentInventoryQuantityControl({
  row,
  allowZeroQuantity = false,
  otherSourceQuantity = 0,
  onSetPurchaseQuantity,
  onRemove,
  removeAriaLabel,
}: EquipmentInventoryQuantityControlProps) {
  const maxQuantity = row.maxQuantity ?? EQUIPMENT_PURCHASE_QUANTITY_MAX
  const minQuantity = allowZeroQuantity ? 0 : 1

  return (
    <div className={equipmentInventoryRowQuantityClasses}>
      <EquipmentQuantityStepper
        ariaLabel={inventoryQuantityAriaLabel(row.equipmentName, otherSourceQuantity)}
        additional={otherSourceQuantity > 0}
        size="sm"
        digits={EQUIPMENT_STEP_QUANTITY_INPUT_DIGITS}
        min={minQuantity}
        max={maxQuantity}
        value={row.entry.quantity}
        disabled={!onSetPurchaseQuantity}
        {...(onRemove && removeAriaLabel
          ? { remove: { onRemove, ariaLabel: removeAriaLabel } }
          : {})}
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
