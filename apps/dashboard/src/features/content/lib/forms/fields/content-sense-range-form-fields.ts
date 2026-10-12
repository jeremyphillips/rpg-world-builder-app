import { SENSE_RANGES, TELEPATHY_MILE_FEET } from '@rpg/contracts'
import type { JoinedPairFieldConfig } from '@rpg/ui/form'

export const SENSE_RANGE_PLACEHOLDER = '—'

export const SENSE_RANGE_UNIT = 'ft' as const

export const SENSE_RANGE_UNIT_LABEL = 'ft.'

/** Shared amount options for grant senses and creature special senses. */
export const senseRangeAmountOptions = SENSE_RANGES.map((range) => ({
  value: range,
  label: String(range),
}))

/** Feet is the only sense-range unit. */
export const senseRangeUnitOptions = [
  { value: SENSE_RANGE_UNIT, label: SENSE_RANGE_UNIT_LABEL },
] as const

export const TELEPATHY_RANGE_UNITS = ['ft', 'mile'] as const

export type TelepathyRangeUnit = (typeof TELEPATHY_RANGE_UNITS)[number]

export const telepathyRangeUnitOptions = [
  { value: 'ft' satisfies TelepathyRangeUnit, label: SENSE_RANGE_UNIT_LABEL },
  { value: 'mile' satisfies TelepathyRangeUnit, label: 'mile' },
] as const

const TELEPATHY_MILE_AMOUNT_OPTIONS = [{ value: 1, label: '1' }] as const

/** Amount options for the active telepathy unit. Feet matches sense ranges. */
export function telepathyRangeAmountOptions(unit: TelepathyRangeUnit) {
  return unit === 'mile' ? TELEPATHY_MILE_AMOUNT_OPTIONS : senseRangeAmountOptions
}

/** Reads a stored telepathy distance. An empty value stays on the feet unit. */
export function telepathyRangeFromFeet(feet: number | undefined): {
  amount: number | undefined
  unit: TelepathyRangeUnit
} {
  if (feet === TELEPATHY_MILE_FEET) return { amount: 1, unit: 'mile' }
  if (feet == null) return { amount: undefined, unit: 'ft' }
  return { amount: feet, unit: 'ft' }
}

/** Writes a telepathy amount and unit back to stored feet. */
export function feetFromTelepathyRange(
  amount: number | undefined,
  unit: TelepathyRangeUnit,
): number | undefined {
  if (amount == null) return undefined
  if (unit === 'mile') return TELEPATHY_MILE_FEET
  return amount
}

/** Grant-row sense range — preset feet select with a feet unit select. */
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
      options: senseRangeAmountOptions,
      placeholder: SENSE_RANGE_PLACEHOLDER,
      digits: 3,
      ariaLabel: 'Range',
    },
    end: {
      kind: 'select',
      name: 'senseRangeUnit',
      options: [...senseRangeUnitOptions],
      defaultValue: SENSE_RANGE_UNIT,
      sizingLabels: [SENSE_RANGE_UNIT_LABEL],
      ariaLabel: 'Range unit',
    },
    ...overrides,
  }
}
