import { CURRENCIES, CURRENCY_IDS, type Currency } from '@rpg/contracts'
import { toOptions, type FieldConfig, type FieldOption, type RowConfig } from '@rpg/ui/form'

type GroupField = FieldConfig | RowConfig

const currencyOptions = toOptions(
  CURRENCY_IDS,
  Object.fromEntries(CURRENCY_IDS.map((c) => [c, CURRENCIES[c].label])) as Record<Currency, string>,
)

/** Identity fields shared by every catalog content type (slug is derived, not authored). */
export function identityFields(): GroupField[] {
  return [
    { type: 'text', name: 'name', label: 'Name', required: true },
    { type: 'richtext', name: 'description', label: 'Description' },
  ]
}

/** Cost amount + currency row (`cost.amount`, `cost.currency`). */
export function costFields(required = true): GroupField[] {
  return [
    {
      kind: 'row',
      fields: [
        {
          type: 'number',
          name: 'cost.amount',
          label: 'Cost',
          min: 0,
          required,
        },
        {
          type: 'select',
          name: 'cost.currency',
          label: 'Currency',
          options: currencyOptions,
          required,
        },
      ],
    },
  ]
}

/** Optional weight in pounds (`weight.value`; unit is always `lb` in `toInput`). */
export function optionalWeightFields(): GroupField[] {
  return [
    {
      type: 'number',
      name: 'weight.value',
      label: 'Weight (lb)',
      min: 0,
      step: 0.5,
      hint: 'Leave blank for no weight',
    },
  ]
}

export function weightFromForm(
  value: number | undefined,
): { value: number; unit: 'lb' } | undefined {
  return value !== undefined && !Number.isNaN(value) ? { value, unit: 'lb' } : undefined
}

export function weightToForm(
  weight: { value: number; unit: 'lb' } | undefined,
): number | undefined {
  return weight?.value
}

export function costToFormDefaults(): { amount: number; currency: Currency } {
  return { amount: 0, currency: 'gp' }
}

export { currencyOptions, type FieldOption }
