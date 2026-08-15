import {
  CURRENCY_IDS,
  getCurrencyAbbrev,
  type CharacterWealthGrant,
  type Currency,
} from '@rpg/contracts'
import { toOptions, type FieldConfig, type FormItem } from '@rpg/ui/form'

const currencyOptions = toOptions(
  CURRENCY_IDS,
  Object.fromEntries(CURRENCY_IDS.map((c) => [c, getCurrencyAbbrev(c)])) as Record<
    Currency,
    string
  >,
)

const WEALTH_GRANT_DENOMINATIONS = [
  'cp',
  'sp',
  'gp',
  'pp',
] as const satisfies readonly (keyof CharacterWealthGrant)[]

export type WealthGrantForm = Partial<Record<(typeof WEALTH_GRANT_DENOMINATIONS)[number], number>>

export type WealthGrantMoneyForm = { amount: number; currency: Currency }

/** Single amount + currency field for sparse wealth grants (starting equipment, level 0 NPCs, etc.). */
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
          width: 'lg',
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
      fields: [{ kind: 'row', fields }],
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
