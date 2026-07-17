import { describe, expect, it } from 'vitest'

import {
  WEAPON_PROPERTIES,
  getWeaponPropertyEntry,
  getWeaponPropertyLabel,
  weaponPropertySchema,
} from './property'

describe('weaponPropertySchema', () => {
  it('accepts every known property', () => {
    for (const prop of WEAPON_PROPERTIES) {
      expect(weaponPropertySchema.parse(prop)).toBe(prop)
    }
  })

  it('rejects unknown properties', () => {
    expect(weaponPropertySchema.safeParse('silent').success).toBe(false)
  })
})

describe('weapon property vocabulary', () => {
  it('has a label and description for every property', () => {
    for (const prop of WEAPON_PROPERTIES) {
      const entry = getWeaponPropertyEntry(prop)
      expect(entry?.label).toBeTruthy()
      expect(entry?.description).toBeTruthy()
    }
  })

  it('returns labels and falls back for unknown properties', () => {
    expect(getWeaponPropertyLabel('finesse')).toBe('Finesse')
    expect(getWeaponPropertyLabel('custom')).toBe('custom')
  })
})
