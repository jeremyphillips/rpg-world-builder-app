import { describe, expect, it } from 'vitest'
import { loadSeedEquipment } from '@rpg/catalog/equipment'
import { createEquipmentInputSchema } from '@rpg/contracts'

import { equipmentFormDef, type EquipmentFormValues } from '../../lib/equipment-form-def'
import { damageToForm, weaponFormFieldGroup } from './weapon-form-fields'

const WEAPON_SEEDS = loadSeedEquipment('srd-cc-5.2.1').filter((item) => item.kind === 'weapon')

describe('weapon kindFieldGroups', () => {
  it('buildFields composes identity, economy, and registered weapon group', () => {
    const fields = equipmentFormDef.buildFields({ equipmentKind: 'weapon' })
    const legends = fields
      .filter(
        (field): field is Extract<(typeof fields)[number], { kind: 'group' }> =>
          'kind' in field && field.kind === 'group',
      )
      .map((field) => field.legend)

    expect(legends).toEqual(['Identity', 'Economy', 'Weapon'])
    expect(fields.at(-1)).toMatchObject({ kind: 'group', legend: 'Weapon' })
  })

  it('uses diceFormula fields for weapon damage and versatile damage in an auto-width row', () => {
    const weaponGroup = weaponFormFieldGroup()
    if (!('fields' in weaponGroup)) {
      throw new Error('expected weapon form group')
    }

    const damageRow = weaponGroup.fields.find(
      (field): field is Extract<(typeof weaponGroup.fields)[number], { kind: 'row' }> =>
        'kind' in field &&
        field.kind === 'row' &&
        field.fields.some((child) => !('kind' in child) && child.name === 'damageDice'),
    )
    if (!damageRow || !('fields' in damageRow)) {
      throw new Error('expected damage dice row')
    }

    expect(damageRow.fields).toEqual([
      expect.objectContaining({
        name: 'damageDice',
        label: 'Damage',
        modifierMode: 'none',
        size: 'md',
        width: 'auto',
      }),
      expect.objectContaining({
        name: 'versatileDamage',
        label: 'Versatile damage',
        modifierMode: 'none',
        size: 'md',
        width: 'auto',
      }),
    ])
  })

  it('composes damage kind and damage type in a half-width row', () => {
    const weaponGroup = weaponFormFieldGroup()
    if (!('fields' in weaponGroup)) {
      throw new Error('expected weapon form group')
    }

    const damageRow = weaponGroup.fields.find(
      (field): field is Extract<(typeof weaponGroup.fields)[number], { kind: 'row' }> =>
        'kind' in field &&
        field.kind === 'row' &&
        field.fields.some((child) => !('kind' in child) && child.name === 'damageKind'),
    )
    if (!damageRow || !('fields' in damageRow)) {
      throw new Error('expected damage kind/type row')
    }

    expect(damageRow.fields).toEqual([
      expect.objectContaining({ name: 'damageKind', width: '1/2', defaultValue: 'dice' }),
      expect.objectContaining({
        name: 'damageType',
        width: '1/2',
        placeholder: 'Choose...',
        visibility: expect.objectContaining({ dependsOn: ['damageKind'] }),
      }),
    ])
  })

  it('offers none as a damage option for weapons like the net', () => {
    const weaponGroup = weaponFormFieldGroup()
    if (!('fields' in weaponGroup)) {
      throw new Error('expected weapon form group')
    }

    const damageRow = weaponGroup.fields.find(
      (field): field is Extract<(typeof weaponGroup.fields)[number], { kind: 'row' }> =>
        'kind' in field &&
        field.kind === 'row' &&
        field.fields.some((child) => !('kind' in child) && child.name === 'damageKind'),
    )
    if (!damageRow || !('fields' in damageRow)) {
      throw new Error('expected damage kind row')
    }
    const damageKindField = damageRow.fields.find(
      (field) => !('kind' in field) && field.name === 'damageKind',
    )

    expect(damageKindField).toMatchObject({
      options: expect.arrayContaining([{ value: 'none', label: 'None' }]),
    })
    expect(
      weaponGroup.fields.find(
        (field) => !('kind' in field) && field.name === 'hasDamage' && field.type === 'switch',
      ),
    ).toBeUndefined()
  })

  it('uses Choose... placeholders for required weapon selects', () => {
    const weaponGroup = weaponFormFieldGroup()
    if (!('fields' in weaponGroup)) {
      throw new Error('expected weapon form group')
    }

    const coreRow = weaponGroup.fields.find(
      (field): field is Extract<(typeof weaponGroup.fields)[number], { kind: 'row' }> =>
        'kind' in field &&
        field.kind === 'row' &&
        field.fields.some((child) => !('kind' in child) && child.name === 'category'),
    )
    if (!coreRow || !('fields' in coreRow)) {
      throw new Error('expected category/mode/mastery row')
    }

    for (const name of ['category', 'mode', 'mastery'] as const) {
      expect(
        coreRow.fields.find((field) => !('kind' in field) && field.name === name),
      ).toMatchObject({ placeholder: 'Choose...' })
    }
  })

  it('wires range visibility from mode and thrown property', () => {
    const weaponGroup = weaponFormFieldGroup()
    if (!('fields' in weaponGroup)) {
      throw new Error('expected weapon form group')
    }

    const rangeRow = weaponGroup.fields.find(
      (field): field is Extract<(typeof weaponGroup.fields)[number], { kind: 'row' }> =>
        'kind' in field &&
        field.kind === 'row' &&
        field.fields.some((child) => !('kind' in child) && child.name === 'rangeNormal'),
    )
    if (!rangeRow || !('fields' in rangeRow)) {
      throw new Error('expected range row')
    }

    for (const name of ['rangeNormal', 'rangeLong'] as const) {
      expect(
        rangeRow.fields.find((field) => !('kind' in field) && field.name === name),
      ).toMatchObject({
        visibility: {
          dependsOn: ['mode', 'properties'],
        },
      })
    }
  })

  it('wires property and mastery conditional option availability and dynamic hints', () => {
    const weaponGroup = weaponFormFieldGroup()
    if (!('fields' in weaponGroup)) {
      throw new Error('expected weapon form group')
    }

    const propertiesField = weaponGroup.fields.find(
      (field) => !('kind' in field) && field.name === 'properties',
    )
    expect(propertiesField).toMatchObject({
      optionAvailability: { dependsOn: ['mode'] },
      dynamicHint: { dependsOn: ['mode'] },
    })

    const coreRow = weaponGroup.fields.find(
      (field): field is Extract<(typeof weaponGroup.fields)[number], { kind: 'row' }> =>
        'kind' in field &&
        field.kind === 'row' &&
        field.fields.some((child) => !('kind' in child) && child.name === 'mastery'),
    )
    if (!coreRow || !('fields' in coreRow)) {
      throw new Error('expected mastery field row')
    }

    expect(
      coreRow.fields.find((field) => !('kind' in field) && field.name === 'mastery'),
    ).toMatchObject({
      optionAvailability: { dependsOn: ['mode'] },
      dynamicHint: { dependsOn: ['mode'] },
    })
  })
})

describe('damageToForm', () => {
  it('maps dice damage to damageDice', () => {
    expect(damageToForm({ kind: 'dice', count: 2, faces: 6 })).toEqual({
      damageKind: 'dice',
      damageDice: { count: 2, faces: 6 },
    })
  })

  it('maps flat damage to damageAmount', () => {
    expect(damageToForm({ kind: 'flat', amount: 1 })).toEqual({
      damageKind: 'flat',
      damageAmount: 1,
    })
  })

  it('maps absent damage to none', () => {
    expect(damageToForm(undefined)).toEqual({ damageKind: 'none' })
  })
})

describe('weapon form round-trips', () => {
  for (const item of WEAPON_SEEDS) {
    it(`${item.slug}: toFormValues → toInput → schema.parse`, () => {
      const formValues = equipmentFormDef.toFormValues(item) as EquipmentFormValues
      const input = equipmentFormDef.toInput(formValues)
      expect(() => createEquipmentInputSchema.parse(input)).not.toThrow()
    })

    it(`${item.slug}: preserves weapon fields`, () => {
      if (item.kind !== 'weapon') return
      const formValues = equipmentFormDef.toFormValues(item) as EquipmentFormValues
      expect(formValues.category).toBe(item.category)
      expect(formValues.mode).toBe(item.mode)
      expect(formValues.mastery).toBe(item.mastery)
      expect(formValues.properties).toEqual(item.properties)
    })

    it(`${item.slug}: preserves dice damage as damageDice`, () => {
      if (item.kind !== 'weapon' || item.damage?.kind !== 'dice') return
      const formValues = equipmentFormDef.toFormValues(item) as EquipmentFormValues
      expect(formValues.damageDice).toEqual({
        count: item.damage.count,
        faces: item.damage.faces,
      })
    })

    it(`${item.slug}: preserves versatile damage as versatileDamage`, () => {
      if (item.kind !== 'weapon' || !item.versatileDamage) return
      const formValues = equipmentFormDef.toFormValues(item) as EquipmentFormValues
      expect(formValues.versatileDamage).toEqual({
        count: item.versatileDamage.count,
        faces: item.versatileDamage.faces,
      })
    })
  }

  it('maps net to damageKind none', () => {
    const net = WEAPON_SEEDS.find((item) => item.slug === 'net')
    expect(net).toBeDefined()
    const formValues = equipmentFormDef.toFormValues(net!) as EquipmentFormValues
    expect(formValues.damageKind).toBe('none')
  })
})
