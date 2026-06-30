import { describe, expect, it } from 'vitest'

import {
  costFields,
  economyFields,
  optionalWeightFields,
  wealthGrantFields,
  wealthGrantFromForm,
  wealthGrantToForm,
  weightFromForm,
  weightToForm,
} from './content-economy-form-fields'
import { feetInputUnitField } from './content-identity-form-fields'
import { mountCapacitySpeedFields, vehicleCargoSpeedFields } from './content-speed-form-fields'
import { EQUIPMENT_COST_VALUE_DIGITS } from '../../equipment/lib/equipment-cost-config'
import { EQUIPMENT_WEIGHT_VALUE_DIGITS } from '../../equipment/lib/equipment-weight-config'

describe('costFields', () => {
  it('uses static valueDigits when equipment kind is known', () => {
    const [field] = costFields({ kind: 'weapon' })
    expect(field).toMatchObject({
      type: 'inputSelect',
      name: 'cost',
      valueKey: 'amount',
      unitKey: 'currency',
      valueDigits: 2,
      formatGrouped: true,
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
      fixedUnit: 'lb.',
      unitValue: 'lb',
      valueDigits: 2,
      step: 0.5,
      formatGrouped: true,
    })
    expect(field).not.toHaveProperty('unitDisabled')
    expect(field).not.toHaveProperty('options')
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
  it('places cost and weight in an auto-width row', () => {
    const row = economyFields({ kind: 'weapon' })[0]
    expect(row).toMatchObject({ kind: 'row' })
    if (row && 'kind' in row && row.kind === 'row') {
      expect(row).not.toHaveProperty('className')
      expect(row.fields).toHaveLength(2)
      expect(row.fields[0]).toMatchObject({ name: 'cost', width: 'auto' })
      expect(row.fields[1]).toMatchObject({ name: 'weight', width: 'auto' })
    }
  })

  it('returns a row with only cost for service', () => {
    const row = economyFields({ kind: 'service' })[0]
    expect(row).toMatchObject({ kind: 'row' })
    if (row && 'kind' in row && row.kind === 'row') {
      expect(row.fields).toHaveLength(1)
      expect(row.fields[0]).toMatchObject({ name: 'cost', width: 'auto' })
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

describe('wealthGrantFields', () => {
  it('renders cp, sp, gp, and pp under the given prefix', () => {
    const [group] = wealthGrantFields('wealth')
    expect(group).toMatchObject({ kind: 'group', legend: 'Wealth' })
    if (group && 'fields' in group && group.fields[0] && 'fields' in group.fields[0]) {
      expect(group.fields[0]).toMatchObject({ kind: 'row', layout: 'responsive-2' })
      expect(group.fields[0]).not.toHaveProperty('className')
      expect(
        group.fields[0].fields.map((field) => ('name' in field ? field.name : undefined)),
      ).toEqual(['wealth.cp', 'wealth.sp', 'wealth.gp', 'wealth.pp'])
    }
  })
})

describe('scalar unit rows', () => {
  it('uses a flex row at intrinsic width for mount capacity and speed', () => {
    const row = mountCapacitySpeedFields()[0]
    expect(row).toMatchObject({ kind: 'row' })
    if (row && 'kind' in row && row.kind === 'row') {
      expect(row).not.toHaveProperty('layout')
      expect(row).not.toHaveProperty('className')
      expect(row.fields).toEqual([
        expect.objectContaining({ name: 'carryingCapacity', width: 'auto' }),
        expect.objectContaining({ name: 'speed', width: 'auto' }),
      ])
    }
  })

  it('uses a responsive-4 grid row for cargo, speed, crew, and passengers', () => {
    const row = vehicleCargoSpeedFields()[0]
    expect(row).toMatchObject({
      kind: 'row',
      layout: 'responsive-4',
      className: 'w-fit max-w-full md:grid-cols-[auto_auto_auto_auto]',
    })
    if (row && 'kind' in row && row.kind === 'row') {
      expect(row.fields).toEqual([
        expect.objectContaining({ name: 'cargoCapacity', width: 'auto' }),
        expect.objectContaining({ name: 'speed', width: 'auto' }),
        expect.objectContaining({ name: 'crew', width: 'auto' }),
        expect.objectContaining({ name: 'passengers', width: 'auto' }),
      ])
    }
  })
})

describe('wealthGrantFromForm', () => {
  it('returns a strict partial object with positive integers only', () => {
    expect(wealthGrantFromForm({ cp: 0, gp: 19, sp: undefined })).toEqual({ gp: 19 })
    expect(wealthGrantFromForm(undefined)).toBeUndefined()
  })
})

describe('wealthGrantToForm', () => {
  it('round-trips stored wealth into form values', () => {
    expect(wealthGrantToForm({ gp: 90 })).toEqual({ gp: 90 })
    expect(wealthGrantToForm(undefined)).toBeUndefined()
  })
})

describe('feetInputUnitField', () => {
  it('builds an inputUnit field with a fixed ft. label', () => {
    expect(feetInputUnitField('range.value.value', 'Distance')).toMatchObject({
      type: 'inputUnit',
      name: 'range.value.value',
      label: 'Distance',
      unit: 'ft.',
      min: 0,
      valueDigits: 2,
    })
  })

  it('defaults walk speed label when building speed fields', () => {
    expect(feetInputUnitField('speed.walk', 'Walk speed')).toMatchObject({
      type: 'inputUnit',
      name: 'speed.walk',
      label: 'Walk speed',
      unit: 'ft.',
      min: 0,
      valueDigits: 2,
    })
  })
})
