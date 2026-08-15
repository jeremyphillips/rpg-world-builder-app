import { describe, expect, it } from 'vitest'

import { DEFAULT_STANDARD_ARRAY } from '@rpg/contracts'

import { FIXED_SCORES_EMPTY_SCORE_VALUE } from './abilities-form-labels'
import {
  assignScoreFromPool,
  clearAbilityScore,
  formatFixedScoreOptionLabel,
  getFixedScoresRemainingCount,
  getScoreOptionsForAbility,
  moveAssignedScore,
  replaceScoreFromPool,
  swapAssignedScores,
} from './fixed-scores-assignment.lib'

describe('formatFixedScoreOptionLabel', () => {
  it('returns the score when unassigned', () => {
    expect(formatFixedScoreOptionLabel(15)).toBe('15')
  })

  it('includes the ability abbreviation when assigned elsewhere', () => {
    expect(formatFixedScoreOptionLabel(15, 'str')).toBe('15 — assigned to STR')
  })
})

describe('getScoreOptionsForAbility', () => {
  it('disables scores assigned to other abilities', () => {
    const options = getScoreOptionsForAbility('dex', { str: 15, con: 13 }, DEFAULT_STANDARD_ARRAY)

    const fifteen = options.find((option) => option.value === '15')
    const thirteen = options.find((option) => option.value === '13')
    const fourteen = options.find((option) => option.value === '14')

    expect(fifteen).toMatchObject({ disabled: true, assignedTo: 'str' })
    expect(thirteen).toMatchObject({ disabled: true, assignedTo: 'con' })
    expect(fourteen).toMatchObject({ disabled: false })
  })

  it('keeps the current row score enabled', () => {
    const options = getScoreOptionsForAbility('str', { str: 15, con: 13 }, DEFAULT_STANDARD_ARRAY)

    const fifteen = options.find((option) => option.value === '15')
    expect(fifteen).toMatchObject({ disabled: false })
  })

  it('includes an empty option', () => {
    const options = getScoreOptionsForAbility('str', {}, DEFAULT_STANDARD_ARRAY)
    expect(options[0]).toEqual({
      value: FIXED_SCORES_EMPTY_SCORE_VALUE,
      label: '—',
      disabled: false,
    })
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
