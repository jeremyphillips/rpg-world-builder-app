import { describe, expect, expectTypeOf, it } from 'vitest'
import { loadSeedWeapons } from '@rpg/catalog/weapons'
import { createWeaponInputSchema, type CreateWeaponInput } from '@rpg/contracts'

import { weaponFormDef, type WeaponFormValues } from './weapon-form-def'

const SRD_WEAPONS = loadSeedWeapons('srd-cc-5.2.1')

it('type: toInput return type matches CreateWeaponInput', () => {
  expectTypeOf(weaponFormDef.toInput).returns.toEqualTypeOf<CreateWeaponInput>()
})

describe('weaponFormDef round-trips', () => {
  for (const weapon of SRD_WEAPONS) {
    it(`${weapon.slug}: toFormValues → toInput → schema.parse`, () => {
      const formValues = weaponFormDef.toFormValues(weapon) as WeaponFormValues
      const input = weaponFormDef.toInput(formValues)
      expect(() => createWeaponInputSchema.parse(input)).not.toThrow()
    })

    it(`${weapon.slug}: name and category preserved`, () => {
      const formValues = weaponFormDef.toFormValues(weapon) as WeaponFormValues
      const input = weaponFormDef.toInput(formValues)
      expect(input.name).toBe(weapon.name)
      expect(input.category).toBe(weapon.category)
    })
  }
})
