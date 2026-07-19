import { describe, expect, it } from 'vitest'

import { resolveCharacterXpDisplay, resolveCharacterXpFloor, resolveXpRequiredForLevel } from './xp'

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
