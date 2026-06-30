import { describe, expect, it } from 'vitest'

import {
  WEAPON_MASTERIES_INCOMPATIBLE_WITH_MODE,
  WEAPON_PROPERTIES_INCOMPATIBLE_WITH_MODE,
  filterWeaponPropertiesForMode,
  formatWeaponMasteryModeHint,
  formatWeaponPropertyModeHint,
  getWeaponPropertyModeAdvisories,
  isWeaponMasteryCompatibleWithMode,
  isWeaponPropertyCompatibleWithMode,
  weaponFormValuesHaveRange,
} from './compatibility'

describe('WEAPON_PROPERTIES_INCOMPATIBLE_WITH_MODE', () => {
  it('lists ranged-only and melee-only property sets', () => {
    expect(WEAPON_PROPERTIES_INCOMPATIBLE_WITH_MODE.ranged).toEqual(['reach', 'versatile'])
    expect(WEAPON_PROPERTIES_INCOMPATIBLE_WITH_MODE.melee).toEqual(['ammunition', 'loading'])
  })
})

describe('WEAPON_MASTERIES_INCOMPATIBLE_WITH_MODE', () => {
  it('lists cleave as incompatible with ranged only', () => {
    expect(WEAPON_MASTERIES_INCOMPATIBLE_WITH_MODE.melee).toEqual([])
    expect(WEAPON_MASTERIES_INCOMPATIBLE_WITH_MODE.ranged).toEqual(['cleave'])
  })
})

describe('isWeaponPropertyCompatibleWithMode', () => {
  it('allows cross-mode properties', () => {
    expect(isWeaponPropertyCompatibleWithMode('thrown', 'ranged')).toBe(true)
    expect(isWeaponPropertyCompatibleWithMode('light', 'ranged')).toBe(true)
    expect(isWeaponPropertyCompatibleWithMode('finesse', 'ranged')).toBe(true)
  })

  it('rejects mode-specific incompatibilities', () => {
    expect(isWeaponPropertyCompatibleWithMode('reach', 'ranged')).toBe(false)
    expect(isWeaponPropertyCompatibleWithMode('versatile', 'ranged')).toBe(false)
    expect(isWeaponPropertyCompatibleWithMode('ammunition', 'melee')).toBe(false)
    expect(isWeaponPropertyCompatibleWithMode('loading', 'melee')).toBe(false)
  })
})

describe('filterWeaponPropertiesForMode', () => {
  it('removes incompatible properties for the target mode', () => {
    expect(filterWeaponPropertiesForMode(['reach', 'finesse', 'versatile'], 'ranged')).toEqual([
      'finesse',
    ])
    expect(filterWeaponPropertiesForMode(['ammunition', 'loading', 'thrown'], 'melee')).toEqual([
      'thrown',
    ])
  })
})

describe('isWeaponMasteryCompatibleWithMode', () => {
  it('rejects cleave for ranged weapons', () => {
    expect(isWeaponMasteryCompatibleWithMode('cleave', 'ranged')).toBe(false)
    expect(isWeaponMasteryCompatibleWithMode('cleave', 'melee')).toBe(true)
    expect(isWeaponMasteryCompatibleWithMode('vex', 'ranged')).toBe(true)
  })
})

describe('weaponFormValuesHaveRange', () => {
  it('is true for ranged mode', () => {
    expect(weaponFormValuesHaveRange({ mode: 'ranged' })).toBe(true)
    expect(weaponFormValuesHaveRange({ mode: 'ranged', properties: [] })).toBe(true)
  })

  it('is true for melee weapons with thrown', () => {
    expect(weaponFormValuesHaveRange({ mode: 'melee', properties: ['thrown'] })).toBe(true)
    expect(weaponFormValuesHaveRange({ mode: 'melee', properties: ['finesse', 'thrown'] })).toBe(
      true,
    )
  })

  it('is false for melee without thrown', () => {
    expect(weaponFormValuesHaveRange({ mode: 'melee' })).toBe(false)
    expect(weaponFormValuesHaveRange({ mode: 'melee', properties: ['finesse'] })).toBe(false)
  })
})

describe('getWeaponPropertyModeAdvisories', () => {
  it('returns advisories for incompatible selected properties', () => {
    expect(
      getWeaponPropertyModeAdvisories({ mode: 'ranged', properties: ['reach', 'finesse'] }),
    ).toEqual([
      {
        property: 'reach',
        mode: 'ranged',
        message: "Reach isn't compatible with ranged weapons.",
      },
    ])
  })

  it('returns empty when mode or properties are absent', () => {
    expect(getWeaponPropertyModeAdvisories({ properties: ['reach'] })).toEqual([])
    expect(getWeaponPropertyModeAdvisories({ mode: 'ranged' })).toEqual([])
  })
})

describe('formatWeaponPropertyModeHint', () => {
  it('returns undefined when mode is unset', () => {
    expect(formatWeaponPropertyModeHint(undefined)).toBeUndefined()
  })

  it('lists disabled property labels for the mode', () => {
    expect(formatWeaponPropertyModeHint('ranged')).toBe(
      "Reach and Versatile aren't available for ranged weapons.",
    )
    expect(formatWeaponPropertyModeHint('melee')).toBe(
      "Ammunition and Loading aren't available for melee weapons.",
    )
  })
})

describe('formatWeaponMasteryModeHint', () => {
  it('returns undefined when mode is unset or no masteries are disabled', () => {
    expect(formatWeaponMasteryModeHint(undefined)).toBeUndefined()
    expect(formatWeaponMasteryModeHint('melee')).toBeUndefined()
  })

  it('lists disabled mastery labels for ranged mode', () => {
    expect(formatWeaponMasteryModeHint('ranged')).toBe("Cleave isn't available for ranged weapons.")
  })
})
