import { describe, expect, it } from 'vitest'

import {
  findAbilityAssignedToScore,
  getAssignedScoreCount,
  getAssignedStandardArrayScores,
  getAvailableStandardArrayScores,
  isStandardArrayAssignment,
  resolveAbilityGenerationMethod,
  STANDARD_ARRAY,
} from './ability-generation'

const completeStandardScores = {
  str: 15,
  dex: 14,
  con: 13,
  int: 12,
  wis: 10,
  cha: 8,
} as const

describe('resolveAbilityGenerationMethod', () => {
  it('prefers standard-array when both methods are allowed', () => {
    expect(
      resolveAbilityGenerationMethod({
        methods: ['manual', 'standard-array'],
        standardArray: [...STANDARD_ARRAY],
      }),
    ).toBe('standard-array')
  })

  it('falls back to the first method when standard-array is unavailable', () => {
    expect(
      resolveAbilityGenerationMethod({
        methods: ['manual'],
        standardArray: [...STANDARD_ARRAY],
      }),
    ).toBe('manual')
  })
})

describe('getAssignedStandardArrayScores', () => {
  it('returns only assigned numeric scores in ability order', () => {
    expect(getAssignedStandardArrayScores({ str: 15, dex: 14 })).toEqual([15, 14])
  })
})

describe('getAssignedScoreCount', () => {
  it('counts assigned abilities', () => {
    expect(getAssignedScoreCount({ str: 15, con: 13 })).toBe(2)
  })
})

describe('getAvailableStandardArrayScores', () => {
  it('removes assigned values from the pool', () => {
    expect(getAvailableStandardArrayScores({ str: 15, con: 13 }, STANDARD_ARRAY)).toEqual([
      14, 12, 10, 8,
    ])
  })

  it('returns the full array when nothing is assigned', () => {
    expect(getAvailableStandardArrayScores({}, STANDARD_ARRAY)).toEqual([15, 14, 13, 12, 10, 8])
  })
})

describe('findAbilityAssignedToScore', () => {
  it('returns the ability that owns a score', () => {
    expect(findAbilityAssignedToScore({ str: 15, dex: 14 }, 15)).toBe('str')
  })

  it('can exclude the current ability row', () => {
    expect(findAbilityAssignedToScore({ str: 15 }, 15, 'str')).toBeUndefined()
  })
})

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
