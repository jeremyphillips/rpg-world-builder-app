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

  it('uses diceFormula fields for weapon damage and versatile damage', () => {
    const weaponGroup = weaponFormFieldGroup()
    if (!('fields' in weaponGroup)) {
      throw new Error('expected weapon form group')
    }

    const diceFields = weaponGroup.fields.filter(
      (field): field is Extract<(typeof weaponGroup.fields)[number], { type: 'diceFormula' }> =>
        !('kind' in field) && field.type === 'diceFormula',
    )

    expect(diceFields).toEqual([
      expect.objectContaining({
        name: 'damageDice',
        label: 'Damage',
        modifierMode: 'none',
        size: 'md',
      }),
      expect.objectContaining({
        name: 'versatileDamage',
        label: 'Versatile damage',
        modifierMode: 'none',
        size: 'md',
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
      }),
    ])
  })

  it('defaults deals damage to on and damage kind to dice', () => {
    const weaponGroup = weaponFormFieldGroup()
    if (!('fields' in weaponGroup)) {
      throw new Error('expected weapon form group')
    }

    expect(
      weaponGroup.fields.find(
        (field) => !('kind' in field) && field.name === 'hasDamage' && field.type === 'switch',
      ),
    ).toMatchObject({ defaultValue: true })
  })
})

describe('damageToForm', () => {
  it('maps dice damage to damageDice', () => {
    expect(damageToForm({ kind: 'dice', count: 2, faces: 6 })).toEqual({
      hasDamage: true,
      damageKind: 'dice',
      damageDice: { count: 2, faces: 6 },
    })
  })

  it('maps flat damage to damageAmount', () => {
    expect(damageToForm({ kind: 'flat', amount: 1 })).toEqual({
      hasDamage: true,
      damageKind: 'flat',
      damageAmount: 1,
    })
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
})
