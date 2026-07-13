import { describe, expect, it } from 'vitest'
import {
  createEquipmentInputSchema,
  formatDice,
  formatWeaponDamage,
  type WeaponEquipment,
} from '@rpg/contracts'

import { pickEquipment } from '../../../lib/fixtures/pick'
import { toEquipmentFormValues } from '../../lib/test-utils/equipment-form-test-utils'
import { equipmentFormDef } from '../../lib/equipment-form-def'

const WEAPON_FIXTURES = {
  longsword: {
    slug: 'longsword',
    damage: { dice: { count: 1, faces: 8 } },
    versatileDamage: { count: 1, faces: 10 },
    display: '1d8',
    versatileDisplay: '1d10',
  },
  blowgun: {
    slug: 'blowgun',
    damage: { flat: 1 },
    display: '1',
  },
  net: {
    slug: 'net',
    damage: undefined,
  },
} as const

function pickWeapon(slug: string): WeaponEquipment {
  const item = pickEquipment(slug)
  if (item.kind !== 'weapon') {
    throw new Error(`expected weapon fixture ${slug}`)
  }
  return item
}

describe('weapon RollValue form round trips', () => {
  for (const fixture of Object.values(WEAPON_FIXTURES)) {
    it(`${fixture.slug}: entity → form values → input → schema.parse`, () => {
      const weapon = pickWeapon(fixture.slug)
      const formValues = toEquipmentFormValues(weapon)
      const input = equipmentFormDef.toInput(formValues)

      expect(() => createEquipmentInputSchema.parse(input)).not.toThrow()

      if (fixture.damage === undefined) {
        expect(formValues.hasDamage).toBe(false)
        expect(input).not.toHaveProperty('damage')
      } else {
        expect(formValues.hasDamage).toBe(true)
        expect(formValues.damage).toEqual(fixture.damage)
        expect(input).toMatchObject({ damage: fixture.damage })
      }
    })
  }

  it('longsword: preserves versatile damage dice', () => {
    const weapon = pickWeapon('longsword')
    const formValues = toEquipmentFormValues(weapon)

    expect(formValues.versatileDamage).toEqual(WEAPON_FIXTURES.longsword.versatileDamage)
  })
})

describe('weapon RollValue display strings', () => {
  it('longsword: formats dice damage and versatile line', () => {
    const weapon = pickWeapon('longsword')
    expect(formatWeaponDamage(weapon.damage!)).toBe(WEAPON_FIXTURES.longsword.display)
    expect(formatDice(weapon.versatileDamage!)).toBe(WEAPON_FIXTURES.longsword.versatileDisplay)
  })

  it('blowgun: formats flat-only damage', () => {
    const weapon = pickWeapon('blowgun')
    expect(formatWeaponDamage(weapon.damage!)).toBe(WEAPON_FIXTURES.blowgun.display)
  })

  it('net: has no damage to format', () => {
    const weapon = pickWeapon('net')
    expect(weapon.damage).toBeUndefined()
  })
})
