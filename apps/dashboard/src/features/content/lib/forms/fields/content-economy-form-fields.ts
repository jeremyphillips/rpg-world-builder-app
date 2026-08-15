import { CURRENCY_IDS, getCurrencyAbbrev, type Currency, type EquipmentKind } from '@rpg/contracts'
import {
  toOptions,
  type DependentConfig,
  type FieldConfig,
  type FieldOption,
  type FormItem,
} from '@rpg/ui/form'

import {
  EQUIPMENT_COST_VALUE_DIGITS,
  costValueDigitsForKind,
} from '../../../equipment/lib/equipment-cost-config'
import {
  EQUIPMENT_WEIGHT_VALUE_DIGITS,
  isWeightEquipmentKind,
  weightValueDigitsForKind,
} from '../../../equipment/lib/equipment-weight-config'
import { scalarUnitInputSelectField } from './content-speed-form-fields'

const currencyOptions = toOptions(
  CURRENCY_IDS,
  Object.fromEntries(CURRENCY_IDS.map((c) => [c, getCurrencyAbbrev(c)])) as Record<
    Currency,
    string
  >,
)

const weightUnitOptions: FieldOption[] = [{ value: 'lb', label: 'lb.' }]

const MARKET_PRICE_TOOLTIP =
  'Items without a market price cannot be purchased through standard equipment purchasing flows, but may still be granted or added through other workflows.'

function costInputField(
  options: { kind?: EquipmentKind; width?: FieldConfig['width'] } = {},
): FieldConfig {
  const { kind, width = 'auto' } = options
  return {
    type: 'inputSelect',
    name: 'cost',
    label: 'Cost',
    inputType: 'number',
    valueKey: 'amount',
    unitKey: 'currency',
    options: currencyOptions,
    min: 1,
    width,
    required: true,
    formatGrouped: true,
    ...(kind
      ? { valueDigits: costValueDigitsForKind(kind) }
      : {
          valueDigitsDependsOn: 'kind',
          valueDigitsLookup: EQUIPMENT_COST_VALUE_DIGITS,
        }),
  }
}

/** Has market price switch with conditional cost amount + currency fields. */
export function costFields(
  options: { kind?: EquipmentKind; width?: FieldConfig['width'] } = {},
): DependentConfig[] {
  const { kind, width = 'auto' } = options
  return [
    {
      kind: 'dependent',
      controller: {
        type: 'switch',
        name: 'hasMarketPrice',
        label: 'Has market price',
        info: MARKET_PRICE_TOOLTIP,
        width,
      },
      dependents: {
        surface: { emphasis: 'subtle' },
        fields: [costInputField({ kind, width })],
      },
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
      ...scalarUnitInputSelectField({
        name: 'weight',
        label: 'Weight',
        defaultUnit: 'lb',
        unitOptions: weightUnitOptions,
        step: 0.5,
        formatGrouped: true,
        width,
        ...(kind && isWeightEquipmentKind(kind)
          ? { valueDigits: weightValueDigitsForKind(kind) }
          : {}),
      }),
      ...(kind && isWeightEquipmentKind(kind)
        ? {}
        : {
            valueDigitsDependsOn: 'kind',
            valueDigitsLookup: EQUIPMENT_WEIGHT_VALUE_DIGITS,
          }),
      hint: { text: 'Leave blank if weightless or not tracked.', position: 'below-control' },
      ...(kind && isWeightEquipmentKind(kind)
        ? {}
        : {
            visibility: {
              dependsOn: ['kind'],
              visibleWhen: (watched) => isWeightEquipmentKind(watched.kind as EquipmentKind),
            },
          }),
    } satisfies FieldConfig,
  ]
}

/** Cost and weight in the Economy group at intrinsic width. */
export function economyFields(options: { kind?: EquipmentKind } = {}): FormItem[] {
  return [
    ...costFields({ ...options, width: 'auto' }),
    ...optionalWeightFields({ kind: options.kind, width: 'auto' }),
  ]
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

/** @deprecated Use equipmentEconomyFormDefaults from equipment-economy-form-values for create defaults. */
export function costToFormDefaults(): { currency: Currency } {
  return { currency: 'gp' }
}

export {
  wealthGrantFields,
  wealthGrantFromForm,
  wealthGrantMoneyField,
  wealthGrantMoneyFromForm,
  wealthGrantMoneyToForm,
  wealthGrantToForm,
  type WealthGrantForm,
  type WealthGrantMoneyForm,
} from '@/lib/forms/wealth-grant-form-fields'
