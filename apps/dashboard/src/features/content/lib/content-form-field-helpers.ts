import {
  CURRENCY_IDS,
  getCurrencyAbbrev,
  getMassUnitAbbrev,
  MASS_UNIT_IDS,
  MOUNT_CARRYING_CAPACITY_LABEL,
  type Currency,
  type EquipmentKind,
  type Mass,
  type MassUnit,
  VEHICLE_CARGO_CAPACITY_LABEL,
} from '@rpg/contracts'
import { toOptions, type FieldConfig, type FieldOption, type RowConfig } from '@rpg/ui/form'
import type { NumberInputDigits } from '@rpg/ui'

import { EQUIPMENT_COST_VALUE_DIGITS, costValueDigitsForKind } from './equipment-cost-config'
import {
  EQUIPMENT_WEIGHT_VALUE_DIGITS,
  isWeightEquipmentKind,
  weightValueDigitsForKind,
} from './equipment-weight-config'

type GroupField = FieldConfig | RowConfig

const currencyOptions = toOptions(
  CURRENCY_IDS,
  Object.fromEntries(CURRENCY_IDS.map((c) => [c, getCurrencyAbbrev(c)])) as Record<
    Currency,
    string
  >,
)

const weightUnitOptions: FieldOption[] = [{ value: 'lb', label: 'lb.' }]

/** Identity fields shared by every catalog content type (slug is derived, not authored). */
export function identityFields(): GroupField[] {
  return [
    { type: 'text', name: 'name', label: 'Name', required: true },
    { type: 'richtext', name: 'description', label: 'Description' },
  ]
}

/** Cost amount + currency composite (`cost.amount`, `cost.currency`). */
export function costFields(
  options: { kind?: EquipmentKind; required?: boolean; width?: FieldConfig['width'] } = {},
): FieldConfig[] {
  const { kind, required = true, width = 'auto' } = options
  return [
    {
      type: 'inputSelect',
      name: 'cost',
      label: 'Cost',
      inputType: 'number',
      valueKey: 'amount',
      unitKey: 'currency',
      options: currencyOptions,
      min: 0,
      width,
      required,
      formatGrouped: true,
      defaultValue: costToFormDefaults(),
      ...(kind
        ? { valueDigits: costValueDigitsForKind(kind) }
        : {
            valueDigitsDependsOn: 'kind',
            valueDigitsLookup: EQUIPMENT_COST_VALUE_DIGITS,
          }),
    },
  ]
}

/** Optional weight in pounds (`weight.value` + fixed `lb` unit). */
export function optionalWeightFields(
  options: { kind?: EquipmentKind; width?: FieldConfig['width'] } = {},
): FieldConfig[] {
  const { kind, width = 'auto' } = options

  if (kind === 'service') return []

  return [
    {
      type: 'inputSelect',
      name: 'weight',
      label: 'Weight',
      inputType: 'number',
      valueKey: 'value',
      unitKey: 'unit',
      options: weightUnitOptions,
      unitDisabled: true,
      min: 0,
      step: 0.5,
      width,
      formatGrouped: true,
      hint: 'Leave blank for no weight',
      defaultValue: weightToFormDefaults(),
      ...(kind && isWeightEquipmentKind(kind)
        ? { valueDigits: weightValueDigitsForKind(kind) }
        : {
            visibility: {
              dependsOn: ['kind'],
              visibleWhen: (watched) => isWeightEquipmentKind(watched.kind as EquipmentKind),
            },
            valueDigitsDependsOn: 'kind',
            valueDigitsLookup: EQUIPMENT_WEIGHT_VALUE_DIGITS,
          }),
    },
  ]
}

/** Cost and weight side-by-side in the Economy group (one-third row each). */
export function economyFields(
  options: { kind?: EquipmentKind; required?: boolean } = {},
): GroupField[] {
  const fields = [
    ...costFields({ ...options, width: 'full' }),
    ...optionalWeightFields({ kind: options.kind, width: 'full' }),
  ]

  return [{ kind: 'row', className: 'grid w-full grid-cols-1 md:grid-cols-3', fields }]
}

export function weightFromForm(
  weight: { value?: number; unit?: 'lb' } | undefined,
): { value: number; unit: 'lb' } | undefined {
  const value = weight?.value
  return value !== undefined && !Number.isNaN(value) ? { value, unit: 'lb' } : undefined
}

export function weightToForm(
  weight: { value: number; unit: 'lb' } | undefined,
): { value: number; unit: 'lb' } | undefined {
  return weight ? { value: weight.value, unit: 'lb' } : undefined
}

export function weightToFormDefaults(): { unit: 'lb' } {
  return { unit: 'lb' }
}

export function costToFormDefaults(): { amount: number; currency: Currency } {
  return { amount: 0, currency: 'gp' }
}

const massUnitOptions = toOptions(
  MASS_UNIT_IDS,
  Object.fromEntries(MASS_UNIT_IDS.map((u) => [u, getMassUnitAbbrev(u)])) as Record<
    MassUnit,
    string
  >,
)

/** Mass amount + unit composite for mount/vehicle carry limits. */
export function massInputSelectField(options: {
  name: string
  label: string
  required?: boolean
  defaultUnit: MassUnit
  valueDigits?: NumberInputDigits
  width?: FieldConfig['width']
}): FieldConfig {
  const { name, label, required, defaultUnit, valueDigits, width = 'full' } = options
  return {
    type: 'inputSelect',
    name,
    label,
    inputType: 'number',
    valueKey: 'value',
    unitKey: 'unit',
    options: massUnitOptions,
    min: 0,
    step: defaultUnit === 'lb' ? 0.5 : 1,
    width,
    required,
    formatGrouped: true,
    valueDigits,
    defaultValue: massToFormDefaults(defaultUnit),
  }
}

export function massFromForm(
  mass: { value?: number; unit?: MassUnit } | undefined,
): Mass | undefined {
  const value = mass?.value
  const unit = mass?.unit
  if (value === undefined || Number.isNaN(value) || !unit) return undefined
  return { value, unit }
}

export function massToForm(mass: Mass | undefined): Mass | undefined {
  return mass ? { value: mass.value, unit: mass.unit } : undefined
}

export function massToFormDefaults(unit: MassUnit): { unit: MassUnit } {
  return { unit }
}

export {
  currencyOptions,
  MOUNT_CARRYING_CAPACITY_LABEL,
  VEHICLE_CARGO_CAPACITY_LABEL,
  type FieldOption,
}
