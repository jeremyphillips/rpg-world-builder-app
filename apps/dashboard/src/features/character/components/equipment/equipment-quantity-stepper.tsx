import { NumberStepper, type NumberStepperDigits } from '@rpg/ui'

/**
 * Tier for an equipment quantity stepper. `xs` sits inline in a card header band;
 * `sm` is the standalone control on an inventory row.
 */
export type EquipmentQuantityStepperSize = 'xs' | 'sm'

export type EquipmentQuantityStepperProps = {
  value: number
  min: number
  max: number
  size: EquipmentQuantityStepperSize
  digits: NumberStepperDigits
  ariaLabel: string
  /** Renders the `+` adornment — the value stacks on quantities from other sources. */
  additional?: boolean
  disabled?: boolean
  /** Replaces the decrement affordance at the minimum. Ignored when `min` is 0. */
  remove?: { ariaLabel: string; onRemove: () => void }
  onChange: (quantity: number) => void
}

/** The purchase quantity control shared by the inventory row and the picker card header. */
export function EquipmentQuantityStepper({
  value,
  min,
  max,
  size,
  digits,
  ariaLabel,
  additional = false,
  disabled = false,
  remove,
  onChange,
}: EquipmentQuantityStepperProps) {
  const minAction =
    remove && min >= 1
      ? ({ mode: 'remove', onRemove: remove.onRemove, removeAriaLabel: remove.ariaLabel } as const)
      : undefined

  return (
    <NumberStepper
      aria-label={ariaLabel}
      bordered
      size={size}
      digits={digits}
      min={min}
      max={max}
      value={value}
      disabled={disabled}
      valuePrefix={additional ? '+' : undefined}
      minAction={minAction}
      onChange={onChange}
    />
  )
}
