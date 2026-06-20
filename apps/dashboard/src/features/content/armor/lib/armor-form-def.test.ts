import { describe, expect, expectTypeOf, it } from 'vitest'
import { loadSeedArmor } from '@rpg/catalog/armor'
import { createArmorInputSchema, type CreateArmorInput } from '@rpg/contracts'

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
