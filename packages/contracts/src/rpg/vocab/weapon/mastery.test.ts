import { describe, expect, it } from 'vitest'

import {
  WEAPON_MASTERIES,
  WEAPON_MASTERY_ENTRIES,
  getWeaponMasteryEntry,
  getWeaponMasteryLabel,
  weaponMasterySchema,
} from './mastery'

describe('weaponMasterySchema', () => {
  it('accepts every known mastery', () => {
    for (const mastery of WEAPON_MASTERIES) {
      expect(weaponMasterySchema.parse(mastery)).toBe(mastery)
    }
  })

  it('rejects unknown masteries', () => {
    expect(weaponMasterySchema.safeParse('parry').success).toBe(false)
  })
})

describe('weapon mastery vocabulary', () => {
  it('exposes every mastery in WEAPON_MASTERIES', () => {
    expect([...WEAPON_MASTERIES].sort()).toEqual(Object.keys(WEAPON_MASTERY_ENTRIES).sort())
  })

  it('has a label and description for every mastery', () => {
    for (const mastery of WEAPON_MASTERIES) {
      const entry = getWeaponMasteryEntry(mastery)
      expect(entry?.label).toBeTruthy()
      expect(entry?.description).toBeTruthy()
    }
  })

  it('returns labels and falls back for unknown masteries', () => {
    expect(getWeaponMasteryLabel('cleave')).toBe('Cleave')
    expect(getWeaponMasteryLabel('custom')).toBe('custom')
  })
})
