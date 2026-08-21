import { describe, expect, it } from 'vitest'

import {
  assertCharacterXpMutationAllowed,
  CharacterXpMutationError,
  canCharacterGainXp,
  resolveCharacterXpDisplay,
  resolveCharacterXpFloor,
  resolveXpRequiredForLevel,
} from './xp'

const STANDARD_PROGRESSION = {
  entries: [
    { level: 1, xpRequired: 0 },
    { level: 2, xpRequired: 300 },
    { level: 3, xpRequired: 900 },
  ],
}

describe('resolveXpRequiredForLevel', () => {
  it('returns 0 for level 1', () => {
    expect(resolveXpRequiredForLevel(1, STANDARD_PROGRESSION)).toBe(0)
  })

  it('returns the authored threshold for higher levels', () => {
    expect(resolveXpRequiredForLevel(2, STANDARD_PROGRESSION)).toBe(300)
    expect(resolveXpRequiredForLevel(3, STANDARD_PROGRESSION)).toBe(900)
  })
})

describe('resolveCharacterXpDisplay', () => {
  it('returns stored character xp', () => {
    expect(resolveCharacterXpDisplay({ xp: 0 }, STANDARD_PROGRESSION)).toBe(0)
    expect(resolveCharacterXpDisplay({ xp: 300 }, STANDARD_PROGRESSION)).toBe(300)
    expect(resolveCharacterXpDisplay({ xp: null }, STANDARD_PROGRESSION)).toBeNull()
  })
})

describe('canCharacterGainXp', () => {
  it('returns false for classless level 0 characters', () => {
    expect(canCharacterGainXp({ classes: [] })).toBe(false)
  })

  it('returns true when total level is above zero', () => {
    expect(canCharacterGainXp({ classes: [{ classId: 'srd-cc-5.2.1:fighter', level: 1 }] })).toBe(
      true,
    )
  })
})

describe('assertCharacterXpMutationAllowed', () => {
  it('allows null xp for level 0 characters', () => {
    expect(() => assertCharacterXpMutationAllowed({ classes: [], xp: null }, null)).not.toThrow()
  })

  it('rejects positive xp for level 0 characters', () => {
    expect(() => assertCharacterXpMutationAllowed({ classes: [], xp: null }, 100)).toThrow(
      CharacterXpMutationError,
    )
  })
})

describe('resolveCharacterXpFloor', () => {
  it('returns the xp floor for the character total level', () => {
    expect(
      resolveCharacterXpFloor(
        { classes: [{ classId: 'srd-cc-5.2.1:fighter', level: 1 }] },
        STANDARD_PROGRESSION,
      ),
    ).toBe(0)

    expect(
      resolveCharacterXpFloor(
        { classes: [{ classId: 'srd-cc-5.2.1:fighter', level: 2 }] },
        STANDARD_PROGRESSION,
      ),
    ).toBe(300)
  })
})
