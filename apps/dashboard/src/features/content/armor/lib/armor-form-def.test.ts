import { describe, expect, expectTypeOf, it } from 'vitest'
import { loadSeedArmor } from '@rpg/catalog/equipment'
import { createArmorInputSchema, deriveContentKey, type CreateArmorInput } from '@rpg/contracts'

import { armorFormDef, type ArmorFormValues } from './armor-form-def'

const SRD_ARMOR = loadSeedArmor('srd-cc-5.2.1')

it('type: toInput return type matches CreateArmorInput', () => {
  expectTypeOf(armorFormDef.toInput).returns.toEqualTypeOf<CreateArmorInput>()
})

describe('armorFormDef round-trips', () => {
  for (const armor of SRD_ARMOR) {
    it(`${armor.slug}: toFormValues → toInput → schema.parse`, () => {
      const formValues = armorFormDef.toFormValues(armor) as ArmorFormValues
      const input = armorFormDef.toInput(formValues)
      expect(() => createArmorInputSchema.parse(input)).not.toThrow()
    })

    it(`${armor.slug}: name and category preserved`, () => {
      const formValues = armorFormDef.toFormValues(armor) as ArmorFormValues
      const input = armorFormDef.toInput(formValues)
      expect(input.name).toBe(armor.name)
      expect(input.category).toBe(armor.category)
    })
  }
})

describe('armorFormDef create vs update modes', () => {
  it('create: derives slug from name when slug is omitted', () => {
    const formValues = {
      ...armorFormDef.createDefaultValues,
      name: 'Custom Plate',
      baseAc: 18,
    } as ArmorFormValues
    const input = armorFormDef.toInput(formValues)
    expect(input.slug).toBe(deriveContentKey('Custom Plate'))
  })

  it('update: omits slug when entity context is present', () => {
    const armor = SRD_ARMOR[0]!
    const formValues = armorFormDef.toFormValues(armor) as ArmorFormValues
    formValues.name = 'Renamed Armor'
    const input = armorFormDef.toInput(formValues, { entity: armor })
    expect(input).not.toHaveProperty('slug')
    expect(input.name).toBe('Renamed Armor')
  })
})
