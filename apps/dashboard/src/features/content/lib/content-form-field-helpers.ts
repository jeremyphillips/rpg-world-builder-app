import { CURRENCY_IDS, getCurrencyAbbrev, type Currency, type EquipmentKind } from '@rpg/contracts'
import { toOptions, type FieldConfig, type FieldOption, type RowConfig } from '@rpg/ui/form'

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

export { currencyOptions, type FieldOption }
