import {
  CURRENCY_IDS,
  getCurrencyAbbrev,
  getMassUnitAbbrev,
  getSpeedRateUnitAbbrev,
  MASS_UNIT_IDS,
  MOUNT_CARRYING_CAPACITY_LABEL,
  SPEED_RATE_UNIT_IDS,
  type CharacterWealthGrant,
  type Currency,
  type EquipmentKind,
  type Mass,
  type MassUnit,
  type SpeedRate,
  type SpeedRateUnit,
  VEHICLE_CARGO_CAPACITY_LABEL,
} from '@rpg/contracts'
import {
  toOptions,
  type FieldConfig,
  type FieldOption,
  type FormItem,
  type InlineChooseCountFieldConfig,
  type RowConfig,
} from '@rpg/ui/form'
import type { NumberInputDigits } from '@rpg/ui'

import { EQUIPMENT_COST_VALUE_DIGITS, costValueDigitsForKind } from './equipment-cost-config'
import {
  EQUIPMENT_WEIGHT_VALUE_DIGITS,
  isWeightEquipmentKind,
  weightValueDigitsForKind,
} from './equipment-weight-config'
import type { ContentFormCtx } from './content-form-registry'

type GroupField = FieldConfig | RowConfig

const currencyOptions = toOptions(
  CURRENCY_IDS,
  Object.fromEntries(CURRENCY_IDS.map((c) => [c, getCurrencyAbbrev(c)])) as Record<
    Currency,
    string
  >,
)

const weightUnitOptions: FieldOption[] = [{ value: 'lb', label: 'lb.' }]

/** Digit width for walk-speed inline count fields (values such as 30 or 35). */
export const WALK_SPEED_INLINE_COUNT_DIGITS = 2 satisfies NumberInputDigits

/** Inline walk speed field: visible label with `[N] ft.` on the sentence row. */
export function walkSpeedInlineCountField(
  name: string,
  overrides?: Partial<InlineChooseCountFieldConfig>,
): InlineChooseCountFieldConfig {
  return {
    type: 'inlineChooseCount',
    name,
    label: 'Walk speed',
    prefix: '',
    suffix: 'ft.',
    chooseMin: 0,
    digits: WALK_SPEED_INLINE_COUNT_DIGITS,
    ...overrides,
  }
}

/** Identity fields shared by every catalog content type (slug is derived, not authored). */
export function identityFields(ctx?: ContentFormCtx): GroupField[] {
  return [
    { type: 'text', name: 'name', label: 'Name', required: true },
    {
      type: 'richtext',
      name: 'description',
      label: 'Description',
      linkable: true,
      internalLinkOptions: ctx?.options?.richTextInternalLinkOptions,
      contentTypeOptions: ctx?.options?.richTextContentTypeOptions,
    },
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

const massUnitOptions = toOptions(
  MASS_UNIT_IDS,
  Object.fromEntries(MASS_UNIT_IDS.map((u) => [u, getMassUnitAbbrev(u)])) as Record<
    MassUnit,
    string
  >,
)

const speedRateUnitOptions = toOptions(
  SPEED_RATE_UNIT_IDS,
  Object.fromEntries(SPEED_RATE_UNIT_IDS.map((u) => [u, getSpeedRateUnitAbbrev(u)])) as Record<
    SpeedRateUnit,
    string
  >,
)

/** Shared value + unit inputSelect builder for scalar unit enums (mass, speed rate, …). */
function scalarUnitInputSelectField<TUnit extends string>(options: {
  name: string
  label: string
  required?: boolean
  defaultUnit: TUnit
  unitOptions: FieldOption[]
  min?: number
  step?: number
  formatGrouped?: boolean
  unitDisabled?: boolean
  valueDigits?: NumberInputDigits
  width?: FieldConfig['width']
}): FieldConfig {
  const {
    name,
    label,
    required,
    defaultUnit,
    unitOptions,
    min = 0,
    step = 1,
    formatGrouped = false,
    unitDisabled = false,
    valueDigits,
    width = 'full',
  } = options

  return {
    type: 'inputSelect',
    name,
    label,
    inputType: 'number',
    valueKey: 'value',
    unitKey: 'unit',
    options: unitOptions,
    min,
    step,
    width,
    required,
    formatGrouped,
    unitDisabled,
    valueDigits,
    defaultValue: { unit: defaultUnit },
  }
}

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
  return scalarUnitInputSelectField({
    name,
    label,
    required,
    defaultUnit,
    unitOptions: massUnitOptions,
    step: defaultUnit === 'lb' ? 0.5 : 1,
    formatGrouped: true,
    valueDigits,
    width,
  })
}

/** Speed rate amount + unit composite for mounts and vehicles. */
export function speedInputSelectField(options: {
  name?: string
  label?: string
  required?: boolean
  defaultUnit: SpeedRateUnit
  valueDigits?: NumberInputDigits
  width?: FieldConfig['width']
}): FieldConfig {
  const {
    name = 'speed',
    label = 'Speed',
    required = true,
    defaultUnit,
    valueDigits = 3,
    width = 'full',
  } = options

  return scalarUnitInputSelectField({
    name,
    label,
    required,
    defaultUnit,
    unitOptions: speedRateUnitOptions,
    step: 0.5,
    valueDigits,
    width,
  })
}

/** Carrying capacity and speed side-by-side in the Mount group (one-third row each). */
export function mountCapacitySpeedFields(): GroupField[] {
  return [
    {
      kind: 'row',
      layout: 'responsive-3',
      fields: [
        massInputSelectField({
          name: 'carryingCapacity',
          label: MOUNT_CARRYING_CAPACITY_LABEL,
          required: true,
          defaultUnit: 'lb',
          valueDigits: 3,
          width: 'full',
        }),
        speedInputSelectField({
          defaultUnit: 'ft',
          required: true,
          valueDigits: 3,
          width: 'full',
        }),
      ],
    },
  ]
}

/** Cargo and speed side-by-side in the Vehicle group (one-third row each). */
export function vehicleCargoSpeedFields(): GroupField[] {
  return [
    {
      kind: 'row',
      layout: 'responsive-3',
      fields: [
        massInputSelectField({
          name: 'cargoCapacity',
          label: VEHICLE_CARGO_CAPACITY_LABEL,
          defaultUnit: 'ton',
          valueDigits: 3,
          width: 'full',
        }),
        speedInputSelectField({
          defaultUnit: 'mph',
          required: true,
          valueDigits: 3,
          width: 'full',
        }),
      ],
    },
  ]
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

export function speedRateFromForm(
  speed: { value?: number; unit?: SpeedRateUnit } | undefined,
): SpeedRate | undefined {
  const value = speed?.value
  const unit = speed?.unit
  if (value === undefined || Number.isNaN(value) || !unit) return undefined
  return { value, unit }
}

export function speedRateToForm(speed: SpeedRate | undefined): SpeedRate | undefined {
  return speed ? { value: speed.value, unit: speed.unit } : undefined
}

export function speedRateToFormDefaults(unit: SpeedRateUnit): { unit: SpeedRateUnit } {
  return { unit }
}

export {
  currencyOptions,
  MOUNT_CARRYING_CAPACITY_LABEL,
  VEHICLE_CARGO_CAPACITY_LABEL,
  type FieldOption,
}
