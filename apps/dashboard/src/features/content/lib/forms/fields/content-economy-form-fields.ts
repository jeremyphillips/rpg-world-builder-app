import {
  CURRENCY_IDS,
  getCurrencyAbbrev,
  type CharacterWealthGrant,
  type Currency,
  type EquipmentKind,
} from '@rpg/contracts'
import {
  toOptions,
  type FieldConfig,
  type FieldOption,
  type FormItem,
  type RowConfig,
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

type GroupField = FieldConfig | RowConfig

const currencyOptions = toOptions(
  CURRENCY_IDS,
  Object.fromEntries(CURRENCY_IDS.map((c) => [c, getCurrencyAbbrev(c)])) as Record<
    Currency,
    string
  >,
)

const weightUnitOptions: FieldOption[] = [{ value: 'lb', label: 'lb.' }]

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
      hint: 'Leave blank if weightless or not tracked.',
      hintPosition: 'below-control',
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

/** Cost and weight side-by-side in the Economy group at intrinsic width. */
export function economyFields(
  options: { kind?: EquipmentKind; required?: boolean } = {},
): GroupField[] {
  const fields = [
    ...costFields({ ...options, width: 'auto' }),
    ...optionalWeightFields({ kind: options.kind, width: 'auto' }),
  ]

  return [{ kind: 'row', fields }]
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

const WEALTH_GRANT_DENOMINATIONS = [
  'cp',
  'sp',
  'gp',
  'pp',
] as const satisfies readonly (keyof CharacterWealthGrant)[]

export type WealthGrantForm = Partial<Record<(typeof WEALTH_GRANT_DENOMINATIONS)[number], number>>

export type WealthGrantMoneyForm = { amount: number; currency: Currency }

/** Single amount + currency field for sparse wealth grants (starting equipment, etc.). */
export function wealthGrantMoneyField(namePrefix: string): FormItem[] {
  return [
    {
      kind: 'group',
      legend: 'Wealth',
      fields: [
        {
          type: 'inputSelect',
          name: namePrefix,
          label: 'Wealth',
          inputType: 'number',
          valueKey: 'amount',
          unitKey: 'currency',
          options: currencyOptions,
          min: 0,
          width: 'auto',
          formatGrouped: true,
          defaultValue: { amount: 0, currency: 'gp' as Currency },
        },
      ],
    },
  ]
}

/** Maps a money composite to a sparse coin grant (positive integers only). */
export function wealthGrantMoneyFromForm(
  wealth: WealthGrantMoneyForm | undefined,
): CharacterWealthGrant | undefined {
  if (!wealth || wealth.amount <= 0) return undefined
  return { [wealth.currency]: wealth.amount }
}

export function wealthGrantMoneyToForm(
  wealth: CharacterWealthGrant | undefined,
): WealthGrantMoneyForm | undefined {
  if (!wealth) return undefined

  for (const denomination of WEALTH_GRANT_DENOMINATIONS) {
    const value = wealth[denomination]
    if (value !== undefined && value > 0) {
      return { amount: value, currency: denomination }
    }
  }

  return undefined
}

/** Optional coin fields for starting equipment and similar sparse wealth grants. */
export function wealthGrantFields(namePrefix: string): FormItem[] {
  const fields: FieldConfig[] = WEALTH_GRANT_DENOMINATIONS.map((denomination) => ({
    type: 'number',
    name: `${namePrefix}.${denomination}`,
    label: getCurrencyAbbrev(denomination),
    min: 0,
    width: 'sm',
  }))

  return [
    {
      kind: 'group',
      legend: 'Wealth',
      fields: [{ kind: 'row', layout: 'responsive-2', fields }],
    },
  ]
}

/** Maps wealth grant form values to a strict partial coin object (positive integers only). */
export function wealthGrantFromForm(
  wealth: WealthGrantForm | undefined,
): CharacterWealthGrant | undefined {
  if (!wealth) return undefined

  const result: CharacterWealthGrant = {}
  for (const denomination of WEALTH_GRANT_DENOMINATIONS) {
    const value = wealth[denomination]
    if (value !== undefined && !Number.isNaN(value) && value > 0) {
      result[denomination] = value
    }
  }

  return Object.keys(result).length ? result : undefined
}

export function wealthGrantToForm(
  wealth: CharacterWealthGrant | undefined,
): WealthGrantForm | undefined {
  if (!wealth) return undefined

  const result: WealthGrantForm = {}
  for (const denomination of WEALTH_GRANT_DENOMINATIONS) {
    const value = wealth[denomination]
    if (value !== undefined) {
      result[denomination] = value
    }
  }

  return Object.keys(result).length ? result : undefined
}
