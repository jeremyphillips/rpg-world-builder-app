import { describe, expect, it } from 'vitest'

import {
  costFields,
  economyFields,
  optionalWeightFields,
  weightFromForm,
  weightToForm,
} from './content-form-field-helpers'
import { EQUIPMENT_COST_VALUE_DIGITS } from './equipment-cost-config'
import { EQUIPMENT_WEIGHT_VALUE_DIGITS } from './equipment-weight-config'

describe('costFields', () => {
  it('uses static valueDigits when equipment kind is known', () => {
    const [field] = costFields({ kind: 'weapon' })
    expect(field).toMatchObject({
      type: 'inputSelect',
      name: 'cost',
      valueKey: 'amount',
      unitKey: 'currency',
      valueDigits: 2,
    })
    expect(field).not.toHaveProperty('valueDigitsDependsOn')
  })

  it('resolves valueDigits dynamically from kind on the hub route', () => {
    const [field] = costFields()
    expect(field).toMatchObject({
      type: 'inputSelect',
      name: 'cost',
      valueDigitsDependsOn: 'kind',
      valueDigitsLookup: EQUIPMENT_COST_VALUE_DIGITS,
    })
    expect(field).not.toHaveProperty('valueDigits')
  })

  it('maps vehicle costs to five digit slots', () => {
    const [field] = costFields({ kind: 'vehicle' })
    expect(field).toMatchObject({ valueDigits: 5 })
  })
})

describe('optionalWeightFields', () => {
  it('uses static valueDigits when equipment kind is known', () => {
    const [field] = optionalWeightFields({ kind: 'weapon' })
    expect(field).toMatchObject({
      type: 'inputSelect',
      name: 'weight',
      valueKey: 'value',
      unitKey: 'unit',
      unitDisabled: true,
      valueDigits: 2,
      step: 0.5,
    })
    expect(field).not.toHaveProperty('valueDigitsDependsOn')
  })

  it('returns no fields for service', () => {
    expect(optionalWeightFields({ kind: 'service' })).toEqual([])
  })

  it('resolves valueDigits dynamically from kind on the hub route', () => {
    const [field] = optionalWeightFields()
    expect(field).toMatchObject({
      type: 'inputSelect',
      name: 'weight',
      valueDigitsDependsOn: 'kind',
      valueDigitsLookup: EQUIPMENT_WEIGHT_VALUE_DIGITS,
      visibility: {
        dependsOn: ['kind'],
      },
    })
    expect(field).not.toHaveProperty('valueDigits')
    if (field && 'visibility' in field && field.visibility) {
      expect(field.visibility.visibleWhen({ kind: 'service' })).toBe(false)
      expect(field.visibility.visibleWhen({ kind: 'weapon' })).toBe(true)
    }
  })

  it('maps vehicle weights to three digit slots', () => {
    const [field] = optionalWeightFields({ kind: 'vehicle' })
    expect(field).toMatchObject({ valueDigits: 3 })
  })
})

describe('economyFields', () => {
  it('places cost and weight in a three-column row', () => {
    const row = economyFields({ kind: 'weapon' })[0]
    expect(row).toMatchObject({
      kind: 'row',
      className: 'grid w-full grid-cols-1 md:grid-cols-3',
    })
    if (row && 'kind' in row && row.kind === 'row') {
      expect(row.fields).toHaveLength(2)
      expect(row.fields[0]).toMatchObject({ name: 'cost', width: 'full' })
      expect(row.fields[1]).toMatchObject({ name: 'weight', width: 'full' })
    }
  })

  it('returns a row with only cost for service', () => {
    const row = economyFields({ kind: 'service' })[0]
    expect(row).toMatchObject({ kind: 'row' })
    if (row && 'kind' in row && row.kind === 'row') {
      expect(row.fields).toHaveLength(1)
      expect(row.fields[0]).toMatchObject({ name: 'cost', width: 'full' })
    }
  })
})

describe('weightFromForm', () => {
  it('returns undefined when value is absent', () => {
    expect(weightFromForm({ unit: 'lb' })).toBeUndefined()
    expect(weightFromForm(undefined)).toBeUndefined()
  })

  it('returns a weight object when value is present', () => {
    expect(weightFromForm({ value: 3, unit: 'lb' })).toEqual({ value: 3, unit: 'lb' })
  })
})

describe('weightToForm', () => {
  it('round-trips stored weight into form values', () => {
    expect(weightToForm({ value: 1.5, unit: 'lb' })).toEqual({ value: 1.5, unit: 'lb' })
    expect(weightToForm(undefined)).toBeUndefined()
  })
})
