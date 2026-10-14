import { describe, expect, it } from 'vitest'

import { DEFAULT_STANDARD_ARRAY } from '@rpg/contracts'

import {
  assignScoreFromPool,
  buildAbilityScoreSelectUsedBy,
  clearAbilityScore,
  getFixedScoresRemainingCount,
  moveAssignedScore,
  replaceScoreFromPool,
  swapAssignedScores,
} from './fixed-scores-assignment.lib'

describe('buildAbilityScoreSelectUsedBy', () => {
  it('maps scores owned by other abilities', () => {
    const usedBy = buildAbilityScoreSelectUsedBy('dex', { str: 15, con: 13 })

    expect(usedBy[15]).toEqual({ fullName: 'Strength', compactLabel: 'STR' })
    expect(usedBy[13]).toEqual({ fullName: 'Constitution', compactLabel: 'CON' })
    expect(usedBy[14]).toBeUndefined()
  })

  it('omits the current ability score', () => {
    const usedBy = buildAbilityScoreSelectUsedBy('str', { str: 15, dex: 14 })
    expect(usedBy[15]).toBeUndefined()
    expect(usedBy[14]?.compactLabel).toBe('DEX')
  })
})

describe('getFixedScoresRemainingCount', () => {
  it('returns the number of unassigned fixed-score values', () => {
    expect(getFixedScoresRemainingCount({ str: 15, con: 13 }, DEFAULT_STANDARD_ARRAY)).toBe(4)
    expect(getFixedScoresRemainingCount({}, DEFAULT_STANDARD_ARRAY)).toBe(6)
    expect(
      getFixedScoresRemainingCount(
        { str: 15, dex: 14, con: 13, int: 12, wis: 10, cha: 8 },
        DEFAULT_STANDARD_ARRAY,
      ),
    ).toBe(0)
  })
})

describe('score assignment mutations', () => {
  it('assigns a score from the pool to an empty ability', () => {
    expect(assignScoreFromPool({}, 'str', 15)).toEqual({ str: 15 })
  })

  it('replaces a filled ability and returns the old score to the pool implicitly', () => {
    expect(replaceScoreFromPool({ str: 15 }, 'str', 14)).toEqual({ str: 14 })
    expect(
      getFixedScoresRemainingCount(
        replaceScoreFromPool({ str: 15 }, 'str', 14),
        DEFAULT_STANDARD_ARRAY,
      ),
    ).toBe(5)
  })

  it('moves a score and clears the source ability', () => {
    expect(moveAssignedScore({ str: 15, dex: 14 }, 'str', 'con')).toEqual({ dex: 14, con: 15 })
  })

  it('swaps scores between two filled abilities', () => {
    expect(swapAssignedScores({ str: 15, dex: 14 }, 'str', 'dex')).toEqual({ str: 14, dex: 15 })
  })

  it('swaps an assigned score with an empty ability', () => {
    expect(swapAssignedScores({ str: 15, dex: 14 }, 'str', 'con')).toEqual({ dex: 14, con: 15 })
  })

  it('clears an assigned ability', () => {
    expect(clearAbilityScore({ str: 15, dex: 14 }, 'str')).toEqual({ dex: 14 })
  })
})
