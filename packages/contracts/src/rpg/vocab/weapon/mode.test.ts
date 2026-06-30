import { describe, expect, it } from 'vitest'

import {
  WEAPON_MODES,
  WEAPON_MODE_ENTRIES,
  getWeaponModeEntry,
  getWeaponModeLabel,
  weaponModeSchema,
} from './mode'

describe('weaponModeSchema', () => {
  it('accepts every known weapon mode', () => {
    for (const mode of WEAPON_MODES) {
      expect(weaponModeSchema.parse(mode)).toBe(mode)
    }
  })

  it('rejects unknown modes', () => {
    expect(weaponModeSchema.safeParse('thrown').success).toBe(false)
  })
})

describe('weapon mode vocabulary', () => {
  it('exposes every mode in WEAPON_MODES', () => {
    expect([...WEAPON_MODES].sort()).toEqual(Object.keys(WEAPON_MODE_ENTRIES).sort())
  })

  it('has a label and description for every mode', () => {
    for (const mode of WEAPON_MODES) {
      const entry = getWeaponModeEntry(mode)
      expect(entry?.label).toBeTruthy()
      expect(entry?.description).toBeTruthy()
    }
  })

  it('returns labels and falls back for unknown modes', () => {
    expect(getWeaponModeLabel('melee')).toBe('Melee')
    expect(getWeaponModeLabel('custom')).toBe('custom')
  })
})
