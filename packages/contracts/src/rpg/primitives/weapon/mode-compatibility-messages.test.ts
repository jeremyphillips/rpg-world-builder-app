import { describe, expect, it } from 'vitest'

import {
  formatWeaponMasteryModeHint,
  formatWeaponPropertyModeHint,
} from '../../primitives/weapon/mode-compatibility-messages'

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
