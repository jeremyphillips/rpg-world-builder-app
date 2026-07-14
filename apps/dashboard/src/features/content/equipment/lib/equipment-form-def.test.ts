import { describe, expect, expectTypeOf, it } from 'vitest'
import { loadSeedEquipment } from '@rpg/catalog/equipment'
import { deriveContentKey, type CreateEquipmentInput } from '@rpg/contracts'

import { STORY_RULESET_ID } from '../../lib/fixtures/constants'
import { equipmentFormDef, type EquipmentFormValues } from './equipment-form-def'
import {
  collectGroupLegends,
  expectSeedRoundTrip,
  toEquipmentFormValues,
} from './test-utils/equipment-form-test-utils'

const SRD_EQUIPMENT = loadSeedEquipment(STORY_RULESET_ID)

it('type: toInput return type matches CreateEquipmentInput', () => {
  expectTypeOf(equipmentFormDef.toInput).returns.toEqualTypeOf<CreateEquipmentInput>()
})

describe('equipmentFormDef round-trips', () => {
  for (const item of SRD_EQUIPMENT) {
    it(`${item.slug}: toFormValues → toInput → schema.parse`, () => {
      expectSeedRoundTrip(item)
    })

    it(`${item.slug}: name and kind preserved`, () => {
      const input = equipmentFormDef.toInput(toEquipmentFormValues(item))
      expect(input.name).toBe(item.name)
      expect(input.kind).toBe(item.kind)
    })
  }
})

describe('equipmentFormDef kind-scoped fields', () => {
  function isGroupField(
    field: ReturnType<typeof equipmentFormDef.buildFields>[number],
  ): field is Extract<typeof field, { kind: 'group' }> {
    return 'kind' in field && field.kind === 'group'
  }

  it('service route shows Identity, Economy, and Service only', () => {
    expect(collectGroupLegends(equipmentFormDef.buildFields({ equipmentKind: 'service' }))).toEqual(
      ['Identity', 'Economy', 'Service'],
    )
  })

  it('service route omits the weight field from Economy', () => {
    const economyFields = equipmentFormDef
      .buildFields({ equipmentKind: 'service' })
      .filter(isGroupField)
      .find((group) => group.legend === 'Economy')?.fields
    const row = economyFields?.find(
      (field): field is Extract<typeof field, { kind: 'row' }> =>
        'kind' in field && field.kind === 'row',
    )
    expect(row?.fields.some((field) => 'name' in field && field.name === 'weight')).toBe(false)
    expect(row?.fields.some((field) => 'name' in field && field.name === 'cost')).toBe(true)
  })

  it('service route omits the Kind select', () => {
    const fields = equipmentFormDef.buildFields({ equipmentKind: 'service' })
    expect(fields.some((field) => 'name' in field && field.name === 'kind')).toBe(false)
  })

  it('service route omits cross-family groups', () => {
    const legends = collectGroupLegends(equipmentFormDef.buildFields({ equipmentKind: 'service' }))
    expect(legends).not.toContain('Weapon')
    expect(legends).not.toContain('Armor')
  })

  it('mount route shows Identity, Economy, and Mount only', () => {
    expect(collectGroupLegends(equipmentFormDef.buildFields({ equipmentKind: 'mount' }))).toEqual([
      'Identity',
      'Economy',
      'Mount',
    ])
  })

  it('tool route shows Identity, Economy, and Tool only', () => {
    expect(collectGroupLegends(equipmentFormDef.buildFields({ equipmentKind: 'tool' }))).toEqual([
      'Identity',
      'Economy',
      'Tool',
    ])
  })

  it('magic item route shows Identity, Economy, and Magic Item only', () => {
    expect(
      collectGroupLegends(equipmentFormDef.buildFields({ equipmentKind: 'magic_item' })),
    ).toEqual(['Identity', 'Economy', 'Magic Item'])
  })

  it('adventuring gear route shows Identity, Economy, and Adventuring Gear only', () => {
    expect(
      collectGroupLegends(equipmentFormDef.buildFields({ equipmentKind: 'adventuring_gear' })),
    ).toEqual(['Identity', 'Economy', 'Adventuring Gear'])
  })

  it('vehicle route shows Identity, Economy, and Vehicle only', () => {
    expect(collectGroupLegends(equipmentFormDef.buildFields({ equipmentKind: 'vehicle' }))).toEqual(
      ['Identity', 'Economy', 'Vehicle'],
    )
  })

  it('armor route shows Identity, Economy, and Armor only', () => {
    expect(collectGroupLegends(equipmentFormDef.buildFields({ equipmentKind: 'armor' }))).toEqual([
      'Identity',
      'Economy',
      'Armor',
    ])
  })

  it('weapon route shows Identity, Economy, and weapon panel group only', () => {
    expect(collectGroupLegends(equipmentFormDef.buildFields({ equipmentKind: 'weapon' }))).toEqual([
      'Identity',
      'Economy',
      '',
    ])
  })
})

describe('equipmentFormDef create vs update modes', () => {
  it('create: derives slug from name when slug is omitted', () => {
    const formValues = {
      ...equipmentFormDef.createDefaultValues,
      name: 'Custom Rope',
    } as EquipmentFormValues
    const input = equipmentFormDef.toInput(formValues)
    expect(input.slug).toBe(deriveContentKey('Custom Rope'))
  })

  it('update: omits slug when entity context is present', () => {
    const item = SRD_EQUIPMENT[0]!
    const formValues = toEquipmentFormValues(item)
    formValues.name = 'Renamed Equipment'
    const input = equipmentFormDef.toInput(formValues, { entity: item })
    expect(input).not.toHaveProperty('slug')
    expect(input.name).toBe('Renamed Equipment')
  })
})
