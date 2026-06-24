import { describe, expect, expectTypeOf, it } from 'vitest'
import { loadSeedWeapons } from '@rpg/catalog/equipment'
import {
  createEquipmentInputSchema,
  deriveContentKey,
  type CreateEquipmentInput,
} from '@rpg/contracts'

import { weaponFormDef, type WeaponFormValues } from './weapon-form-def'

const SRD_WEAPONS = loadSeedWeapons('srd-cc-5.2.1')
type CreateWeaponInput = Extract<CreateEquipmentInput, { kind: 'weapon' }>

it('type: toInput return type matches CreateWeaponInput', () => {
  expectTypeOf(weaponFormDef.toInput).returns.toEqualTypeOf<CreateWeaponInput>()
})

describe('weaponFormDef round-trips', () => {
  for (const weapon of SRD_WEAPONS) {
    it(`${weapon.slug}: toFormValues → toInput → schema.parse`, () => {
      const formValues = weaponFormDef.toFormValues(weapon) as WeaponFormValues
      const input = weaponFormDef.toInput(formValues)
      expect(() => createEquipmentInputSchema.parse(input)).not.toThrow()
    })

    it(`${weapon.slug}: name and category preserved`, () => {
      const formValues = weaponFormDef.toFormValues(weapon) as WeaponFormValues
      const input = weaponFormDef.toInput(formValues)
      expect(input.name).toBe(weapon.name)
      expect(input.category).toBe(weapon.category)
    })
  }
})

describe('weaponFormDef create vs update modes', () => {
  it('create: derives slug from name when slug is omitted', () => {
    const formValues = {
      ...weaponFormDef.createDefaultValues,
      name: 'Custom Longsword',
    } as WeaponFormValues
    const input = weaponFormDef.toInput(formValues)
    expect(input.slug).toBe(deriveContentKey('Custom Longsword'))
  })

  it('update: omits slug when entity context is present', () => {
    const weapon = SRD_WEAPONS[0]!
    const formValues = weaponFormDef.toFormValues(weapon) as WeaponFormValues
    formValues.name = 'Renamed Weapon'
    const input = weaponFormDef.toInput(formValues, { entity: weapon })
    expect(input).not.toHaveProperty('slug')
    expect(input.name).toBe('Renamed Weapon')
  })
})
