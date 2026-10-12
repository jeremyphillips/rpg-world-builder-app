import { SENSE_RANGES } from '@rpg/contracts'
import type { InputSelectOption } from '@rpg/ui'
import type { JoinedPairFieldConfig } from '@rpg/ui/form'

import { SPELL_RANGE_DISTANCE_INLINE_COUNT_DIGITS } from './content-identity-form-fields'

export const SENSE_RANGE_PLACEHOLDER = '—'

export const senseRangeSelectOptions = SENSE_RANGES.map((range) => ({
  value: String(range),
  label: String(range),
}))

export const senseRangeInputSelectOptions: InputSelectOption[] = SENSE_RANGES.map((range) => ({
  value: String(range),
  label: String(range),
}))

/** Shared props for monster sense rows and telepathy distance controls. */
export function monsterSenseRangeInputUnitProps(options?: { id: string; label: string }): {
  id: string
  label: string
  inputType: 'number'
  unit: string
  min: number
  valueDigits: typeof SPELL_RANGE_DISTANCE_INLINE_COUNT_DIGITS
  placeholder: string
  width: 'auto'
} {
  return {
    id: options?.id ?? 'sense-range',
    label: options?.label ?? 'Range',
    inputType: 'number',
    unit: 'ft.',
    min: 0,
    valueDigits: SPELL_RANGE_DISTANCE_INLINE_COUNT_DIGITS,
    placeholder: SENSE_RANGE_PLACEHOLDER,
    width: 'auto',
  }
}

/** Grant-row and monster sense rows — preset range select paired with a feet suffix. */
export function senseRangeJoinedPairField(
  overrides?: Partial<JoinedPairFieldConfig>,
): JoinedPairFieldConfig {
  return {
    type: 'joinedPair',
    label: 'Range',
    width: '1/3',
    start: {
      kind: 'select',
      name: 'senseRange',
      options: senseRangeSelectOptions,
      placeholder: SENSE_RANGE_PLACEHOLDER,
      ariaLabel: 'Range',
    },
    end: {
      kind: 'label',
      text: 'ft.',
      ariaLabel: 'Range unit',
    },
    ...overrides,
  }
}
