import { describe, expect, it } from 'vitest'

import {
  composeComboboxResolveFilteredOptionsFromActive,
  dimensionValueToSelectValue,
  filterComboboxOptionsByActiveFilters,
  reconcileActiveDimensionFilters,
  selectValueToDimensionValue,
  toComboboxFieldOptions,
} from './combobox-field-form.lib'

const toolOptions = [
  {
    value: 'thieves-tools',
    label: "Thieves' tools",
    filterValues: { category: 'thieves' },
    classification: "Thieves' tools",
  },
  {
    value: 'lute',
    label: 'Lute',
    filterValues: { category: 'musical_instrument' },
    classification: 'Musical instrument',
  },
  {
    value: 'dagger',
    label: 'Dagger',
    filterValues: { category: 'simple', mode: 'melee' },
  },
  {
    value: 'longbow',
    label: 'Longbow',
    filterValues: { category: 'martial', mode: 'ranged' },
  },
]

describe('toComboboxFieldOptions', () => {
  it('maps disabledReason onto combobox panel options', () => {
    expect(
      toComboboxFieldOptions([
        {
          value: 'fire',
          label: 'Fire',
          disabled: true,
          disabledReason: 'Already in Vulnerabilities',
        },
      ]),
    ).toEqual([
      {
        value: 'fire',
        label: 'Fire',
        disabled: true,
        disabledReason: 'Already in Vulnerabilities',
      },
    ])
  })
})

describe('dimension select wire adapters', () => {
  it('maps undefined to the internal All wire value and back', () => {
    expect(dimensionValueToSelectValue(undefined)).toBe('__all__')
    expect(selectValueToDimensionValue('__all__')).toBeUndefined()
    expect(selectValueToDimensionValue('melee')).toBe('melee')
  })
})

describe('filterComboboxOptionsByActiveFilters', () => {
  const panelOptions = toComboboxFieldOptions(toolOptions)

  it('returns all options when no dimensions are active (undefined = All)', () => {
    expect(filterComboboxOptionsByActiveFilters(panelOptions, {}, [])).toEqual(panelOptions)
  })

  it('ANDs across active dimension keys', () => {
    expect(
      filterComboboxOptionsByActiveFilters(
        panelOptions,
        { category: 'martial', mode: 'ranged' },
        [],
      ),
    ).toEqual([panelOptions[3]])
  })

  it('excludes options missing filterValues metadata for active dimensions', () => {
    const withoutMetadata = toComboboxFieldOptions([{ value: 'mystery', label: 'Mystery' }])
    expect(
      filterComboboxOptionsByActiveFilters(withoutMetadata, { category: 'simple' }, []),
    ).toEqual([])
  })

  it('keeps selected values visible even when filters exclude them', () => {
    expect(
      filterComboboxOptionsByActiveFilters(panelOptions, { category: 'thieves' }, ['lute']),
    ).toEqual([panelOptions[0], panelOptions[1]])
  })
})

describe('reconcileActiveDimensionFilters', () => {
  const categoryDimension = {
    filterKey: 'category',
    ariaLabel: 'Filter by category',
    options: [
      { value: 'simple', label: 'Simple' },
      { value: 'martial', label: 'Martial' },
    ],
    defaultValue: undefined,
  } as const

  it('drops keys absent from resolved dimension configs', () => {
    expect(
      reconcileActiveDimensionFilters({ category: 'simple', mode: 'melee' }, [categoryDimension]),
    ).toEqual({ category: 'simple' })
  })

  it('resets invalid slugs to defaultValue or undefined', () => {
    expect(
      reconcileActiveDimensionFilters({ category: 'exotic' }, [
        { ...categoryDimension, defaultValue: 'simple' },
      ]),
    ).toEqual({ category: 'simple' })

    expect(reconcileActiveDimensionFilters({ category: 'exotic' }, [categoryDimension])).toEqual({
      category: undefined,
    })
  })

  it('preserves valid keys when configs add a second dimension', () => {
    const dual = [
      categoryDimension,
      {
        filterKey: 'mode',
        ariaLabel: 'Filter by mode',
        options: [
          { value: 'melee', label: 'Melee' },
          { value: 'ranged', label: 'Ranged' },
        ],
      },
    ] as const

    expect(reconcileActiveDimensionFilters({ category: 'simple', mode: 'ranged' }, dual)).toEqual({
      category: 'simple',
      mode: 'ranged',
    })
  })
})

describe('composeComboboxResolveFilteredOptionsFromActive', () => {
  it('applies dimension filtering before the default query filter', () => {
    const resolver = composeComboboxResolveFilteredOptionsFromActive(
      { category: 'thieves' },
      undefined,
    )!
    expect(resolver(toolOptions, 'lute', [])).toEqual([])
    expect(resolver(toolOptions, 'thieves', [])).toEqual([toolOptions[0]])
  })
})
