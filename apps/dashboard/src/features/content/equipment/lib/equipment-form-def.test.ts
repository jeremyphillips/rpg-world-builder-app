import { describe, expect, expectTypeOf, it } from 'vitest'
import { loadSeedEquipment } from '@rpg/catalog/equipment'
import {
  createEquipmentInputSchema,
  deriveContentKey,
  type CreateEquipmentInput,
} from '@rpg/contracts'

import { equipmentFormDef, type EquipmentFormValues } from './equipment-form-def'

const SRD_EQUIPMENT = loadSeedEquipment('srd-cc-5.2.1')

it('type: toInput return type matches CreateEquipmentInput', () => {
  expectTypeOf(equipmentFormDef.toInput).returns.toEqualTypeOf<CreateEquipmentInput>()
})

describe('equipmentFormDef round-trips', () => {
  for (const item of SRD_EQUIPMENT) {
    it(`${item.slug}: toFormValues → toInput → schema.parse`, () => {
      const formValues = equipmentFormDef.toFormValues(item) as EquipmentFormValues
      const input = equipmentFormDef.toInput(formValues)
      expect(() => createEquipmentInputSchema.parse(input)).not.toThrow()
    })

    it(`${item.slug}: name and kind preserved`, () => {
      const formValues = equipmentFormDef.toFormValues(item) as EquipmentFormValues
      const input = equipmentFormDef.toInput(formValues)
      expect(input.name).toBe(item.name)
      expect(input.kind).toBe(item.kind)
    })
  }
})

describe('equipmentFormDef kind-scoped fields', () => {
  function groupLegends(fields: ReturnType<typeof equipmentFormDef.buildFields>): string[] {
    return fields.filter(isGroupField).map((field) => field.legend)
  }

  function isGroupField(
    field: ReturnType<typeof equipmentFormDef.buildFields>[number],
  ): field is Extract<typeof field, { kind: 'group' }> {
    return 'kind' in field && field.kind === 'group'
  }

  it('service route shows Identity, Economy, and Service only', () => {
    expect(groupLegends(equipmentFormDef.buildFields({ equipmentKind: 'service' }))).toEqual([
      'Identity',
      'Economy',
      'Service',
    ])
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
    const legends = groupLegends(equipmentFormDef.buildFields({ equipmentKind: 'service' }))
    expect(legends).not.toContain('Weapon')
    expect(legends).not.toContain('Armor')
  })

  it('mount route shows Identity, Economy, and Mount only', () => {
    expect(groupLegends(equipmentFormDef.buildFields({ equipmentKind: 'mount' }))).toEqual([
      'Identity',
      'Economy',
      'Mount',
    ])
  })

  it('tool route shows Identity, Economy, and Tool only', () => {
    expect(groupLegends(equipmentFormDef.buildFields({ equipmentKind: 'tool' }))).toEqual([
      'Identity',
      'Economy',
      'Tool',
    ])
  })

  it('magic item route shows Identity, Economy, and Magic Item only', () => {
    expect(groupLegends(equipmentFormDef.buildFields({ equipmentKind: 'magic_item' }))).toEqual([
      'Identity',
      'Economy',
      'Magic Item',
    ])
  })

  it('adventuring gear route shows Identity, Economy, and Adventuring Gear only', () => {
    expect(
      groupLegends(equipmentFormDef.buildFields({ equipmentKind: 'adventuring_gear' })),
    ).toEqual(['Identity', 'Economy', 'Adventuring Gear'])
  })

  it('vehicle route shows Identity, Economy, and Vehicle only', () => {
    expect(groupLegends(equipmentFormDef.buildFields({ equipmentKind: 'vehicle' }))).toEqual([
      'Identity',
      'Economy',
      'Vehicle',
    ])
  })

  it('armor route shows Identity, Economy, and Armor only', () => {
    expect(groupLegends(equipmentFormDef.buildFields({ equipmentKind: 'armor' }))).toEqual([
      'Identity',
      'Economy',
      'Armor',
    ])
  })

  it('weapon route shows Identity, Economy, and Weapon only', () => {
    expect(groupLegends(equipmentFormDef.buildFields({ equipmentKind: 'weapon' }))).toEqual([
      'Identity',
      'Economy',
      'Weapon',
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
    const formValues = equipmentFormDef.toFormValues(item) as EquipmentFormValues
    formValues.name = 'Renamed Equipment'
    const input = equipmentFormDef.toInput(formValues, { entity: item })
    expect(input).not.toHaveProperty('slug')
    expect(input.name).toBe('Renamed Equipment')
  })
})
