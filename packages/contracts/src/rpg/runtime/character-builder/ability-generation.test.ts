import { describe, expect, it } from 'vitest'

import { isStandardArrayAssignment, STANDARD_ARRAY } from './ability-generation'

const completeStandardScores = {
  str: 15,
  dex: 14,
  con: 13,
  int: 12,
  wis: 10,
  cha: 8,
} as const

describe('isStandardArrayAssignment', () => {
  it('returns true for an exact standard-array multiset', () => {
    expect(isStandardArrayAssignment(completeStandardScores, STANDARD_ARRAY)).toBe(true)
  })

  it('returns true when values are assigned to different abilities', () => {
    expect(
      isStandardArrayAssignment(
        { str: 8, dex: 10, con: 12, int: 13, wis: 14, cha: 15 },
        STANDARD_ARRAY,
      ),
    ).toBe(true)
  })

  it('returns false when a value is duplicated', () => {
    expect(
      isStandardArrayAssignment(
        { str: 16, dex: 14, con: 13, int: 12, wis: 10, cha: 8 },
        STANDARD_ARRAY,
      ),
    ).toBe(false)
  })

  it('returns false for incomplete assignment', () => {
    expect(isStandardArrayAssignment({ str: 15, dex: 14 }, STANDARD_ARRAY)).toBe(false)
  })
})
