import { describe, expect, it } from 'vitest'

import { STANDARD_ARRAY } from '@rpg/contracts'

import { STANDARD_ARRAY_EMPTY_SCORE_VALUE } from './abilities-form-labels'
import {
  formatStandardArrayOptionLabel,
  getStandardArrayRemainingCount,
  getStandardArrayScoreOptionsForAbility,
} from './standard-array-assignment.lib'

describe('formatStandardArrayOptionLabel', () => {
  it('returns the score when unassigned', () => {
    expect(formatStandardArrayOptionLabel(15)).toBe('15')
  })

  it('includes the ability abbreviation when assigned elsewhere', () => {
    expect(formatStandardArrayOptionLabel(15, 'str')).toBe('15 — assigned to STR')
  })
})

describe('getStandardArrayScoreOptionsForAbility', () => {
  it('disables scores assigned to other abilities', () => {
    const options = getStandardArrayScoreOptionsForAbility(
      'dex',
      { str: 15, con: 13 },
      STANDARD_ARRAY,
    )

    const fifteen = options.find((option) => option.value === '15')
    const thirteen = options.find((option) => option.value === '13')
    const fourteen = options.find((option) => option.value === '14')

    expect(fifteen).toMatchObject({ disabled: true, assignedTo: 'str' })
    expect(thirteen).toMatchObject({ disabled: true, assignedTo: 'con' })
    expect(fourteen).toMatchObject({ disabled: false })
  })

  it('keeps the current row score enabled', () => {
    const options = getStandardArrayScoreOptionsForAbility(
      'str',
      { str: 15, con: 13 },
      STANDARD_ARRAY,
    )

    const fifteen = options.find((option) => option.value === '15')
    expect(fifteen).toMatchObject({ disabled: false })
  })

  it('includes an empty option', () => {
    const options = getStandardArrayScoreOptionsForAbility('str', {}, STANDARD_ARRAY)
    expect(options[0]).toEqual({
      value: STANDARD_ARRAY_EMPTY_SCORE_VALUE,
      label: '—',
      disabled: false,
    })
  })
})

describe('getStandardArrayRemainingCount', () => {
  it('returns the number of unassigned standard-array values', () => {
    expect(getStandardArrayRemainingCount({ str: 15, con: 13 }, STANDARD_ARRAY)).toBe(4)
    expect(getStandardArrayRemainingCount({}, STANDARD_ARRAY)).toBe(6)
    expect(
      getStandardArrayRemainingCount(
        { str: 15, dex: 14, con: 13, int: 12, wis: 10, cha: 8 },
        STANDARD_ARRAY,
      ),
    ).toBe(0)
  })
})
