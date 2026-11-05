import type { JoinedPairFieldConfig } from '@rpg/ui/form'

export const DISTANCE_FEET_UNIT_LABEL = 'ft.'

export const DISTANCE_MILE_UNIT_LABEL = 'mile'

/** Select options for a preset list of whole distances. */
export function distanceAmountOptions(amounts: readonly number[]) {
  return amounts.map((amount) => ({
    value: amount,
    label: String(amount),
  }))
}

export function distanceJoinedPairField(options: {
  amountName: string
  label: string
  presets: readonly number[]
  /** Bound unit path. Omit for a fixed feet label. */
  unitName?: string
  unitOptions?: readonly { value: string; label: string }[]
  /** Start-select options for each unit value. Used with `unitName`. */
  presetsByUnit?: JoinedPairFieldConfig['presetsByUnit']
  allowCustom?: boolean
  clearable?: boolean
  clearAmountWhenUnitChanges?: boolean
  required?: boolean
  hint?: JoinedPairFieldConfig['hint']
  width?: JoinedPairFieldConfig['width']
  visibility?: JoinedPairFieldConfig['visibility']
  digits?: 2 | 3
}): JoinedPairFieldConfig {
  const digits = options.digits ?? 3
  const unitOptions = options.unitOptions ?? []
  const end =
    options.unitName && unitOptions.length > 0
      ? {
          kind: 'select' as const,
          name: options.unitName,
          options: [...unitOptions],
          defaultValue: unitOptions[0]?.value,
          sizingLabels: unitOptions.map((unit) => unit.label),
          ariaLabel: `${options.label} unit`,
        }
      : {
          kind: 'label' as const,
          text: DISTANCE_FEET_UNIT_LABEL,
          ariaLabel: `${options.label} unit`,
        }

  return {
    type: 'joinedPair',
    label: options.label,
    width: options.width ?? 'auto',
    required: options.required,
    hint: options.hint,
    visibility: options.visibility,
    presetsByUnit: options.presetsByUnit,
    clearAmountWhenUnitChanges: options.clearAmountWhenUnitChanges,
    start: {
      kind: 'select',
      name: options.amountName,
      options: distanceAmountOptions(options.presets),
      digits,
      allowCustom: options.allowCustom,
      clearable: options.clearable,
      ariaLabel: `${options.label} value`,
    },
    end,
  }
}
