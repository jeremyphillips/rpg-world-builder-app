import { describe, expect, it } from 'vitest'

import { DEFAULT_STANDARD_ARRAY } from '@rpg/contracts'

import {
  buildFixedScoreSelectOptions,
  getFixedScoresRemainingCount,
  isValidPartialStandardArrayAssignment,
  resolveStandardArrayClearAbility,
  resolveStandardArrayScoreToAbility,
} from './fixed-scores-assignment.lib'

const POOL = DEFAULT_STANDARD_ARRAY

describe('isValidPartialStandardArrayAssignment', () => {
  it('accepts empty and partial valid assignments', () => {
    expect(isValidPartialStandardArrayAssignment({}, POOL)).toBe(true)
    expect(isValidPartialStandardArrayAssignment({ str: 15, dex: 14 }, POOL)).toBe(true)
  })

  it('rejects duplicate assigned values', () => {
    expect(isValidPartialStandardArrayAssignment({ str: 15, dex: 15 }, POOL)).toBe(false)
  })

  it('rejects scores not in the pool', () => {
    expect(isValidPartialStandardArrayAssignment({ str: 99 }, POOL)).toBe(false)
  })
})

describe('getFixedScoresRemainingCount', () => {
  it('returns the number of unassigned fixed-score values', () => {
    expect(getFixedScoresRemainingCount({ str: 15, con: 13 }, POOL)).toBe(4)
    expect(getFixedScoresRemainingCount({}, POOL)).toBe(6)
    expect(
      getFixedScoresRemainingCount({ str: 15, dex: 14, con: 13, int: 12, wis: 10, cha: 8 }, POOL),
    ).toBe(0)
  })
})

describe('resolveStandardArrayScoreToAbility', () => {
  it('assigns a pool score to an empty ability', () => {
    const result = resolveStandardArrayScoreToAbility({}, POOL, 'str', 15)
    expect(result).toEqual({ operation: 'assign', next: { str: 15 } })
  })

  it('assigns a pool score to an occupied ability and frees the old score', () => {
    const result = resolveStandardArrayScoreToAbility({ str: 15 }, POOL, 'str', 14)
    expect(result).toEqual({ operation: 'assign', next: { str: 14 } })
    expect(getFixedScoresRemainingCount(result.next, POOL)).toBe(5)
  })

  it('moves a score to an empty ability', () => {
    const result = resolveStandardArrayScoreToAbility({ str: 15, dex: 14 }, POOL, 'con', 15)
    expect(result).toEqual({ operation: 'move', next: { dex: 14, con: 15 } })
  })

  it('swaps scores between two filled abilities', () => {
    const result = resolveStandardArrayScoreToAbility({ str: 15, dex: 14 }, POOL, 'dex', 15)
    expect(result).toEqual({ operation: 'swap', next: { str: 14, dex: 15 } })
  })

  it('returns current when the target already has the score', () => {
    expect(resolveStandardArrayScoreToAbility({ str: 15 }, POOL, 'str', 15)).toEqual({
      operation: 'current',
    })
  })

  it('rejects scores not in the pool', () => {
    expect(resolveStandardArrayScoreToAbility({}, POOL, 'str', 99)).toEqual({
      operation: 'invalid',
    })
  })

  it('treats selecting an occupied score as move when the target is empty', () => {
    expect(resolveStandardArrayScoreToAbility({ str: 15 }, POOL, 'dex', 15)).toEqual({
      operation: 'move',
      next: { dex: 15 },
    })
  })

  it('rejects mutations when the assignment state is invalid', () => {
    expect(resolveStandardArrayScoreToAbility({ str: 15, dex: 15 }, POOL, 'con', 13)).toEqual({
      operation: 'invalid',
    })
  })

  it('rejects stale drag source scores', () => {
    const result = resolveStandardArrayScoreToAbility({ str: 15, dex: 14 }, POOL, 'con', 12, {
      fromAbility: 'str',
    })
    expect(result).toEqual({ operation: 'invalid' })
  })

  it('supports drag source moves and swaps', () => {
    expect(
      resolveStandardArrayScoreToAbility({ str: 15, dex: 14 }, POOL, 'con', 15, {
        fromAbility: 'str',
      }),
    ).toEqual({ operation: 'move', next: { dex: 14, con: 15 } })

    expect(
      resolveStandardArrayScoreToAbility({ str: 15, dex: 14 }, POOL, 'dex', 15, {
        fromAbility: 'str',
      }),
    ).toEqual({ operation: 'swap', next: { str: 14, dex: 15 } })
  })
})

describe('resolveStandardArrayClearAbility', () => {
  it('clears an assigned ability', () => {
    const result = resolveStandardArrayClearAbility({ str: 15, dex: 14 }, POOL, 'str')
    expect(result).toEqual({ operation: 'clear', next: { dex: 14 } })
  })

  it('rejects clearing an empty ability', () => {
    expect(resolveStandardArrayClearAbility({}, POOL, 'str')).toEqual({ operation: 'invalid' })
  })
})

describe('buildFixedScoreSelectOptions', () => {
  it('returns six options sorted ascending with resolver operations', () => {
    const options = buildFixedScoreSelectOptions('wis', { str: 15, dex: 14 }, POOL)
    expect(options).toHaveLength(6)
    expect(options.map((option) => option.score)).toEqual([8, 10, 12, 13, 14, 15])

    const fourteen = options.find((option) => option.score === 14)
    expect(fourteen?.operation).toBe('move')
    expect(fourteen?.secondaryLabel).toBe('Move from DEX')
    expect(fourteen?.ariaLabel).toBe('Move from Dexterity, 14')

    const swapOptions = buildFixedScoreSelectOptions('wis', { str: 15, wis: 8 }, POOL)
    const fifteen = swapOptions.find((option) => option.score === 15)
    expect(fifteen?.operation).toBe('swap')
    expect(fifteen?.secondaryLabel).toBe('Swap with STR')
  })

  it('labels move from owner on an empty target', () => {
    const options = buildFixedScoreSelectOptions('con', { str: 15 }, POOL)
    const fifteen = options.find((option) => option.score === 15)
    expect(fifteen?.operation).toBe('move')
    expect(fifteen?.secondaryLabel).toBe('Move from STR')
  })
})
