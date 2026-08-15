import { describe, expect, it } from 'vitest'

import { formatFieldMessage } from '../../validation/define-message'
import {
  DEFAULT_STANDARD_ARRAY,
  abilityScoreOrderSchema,
  resolveStandardArrayAssignment,
  standardArraySchema,
} from './standard-array'
import { standardArrayValidationMessages } from './standard-array-messages'

const FIGHTER_ORDER = ['str', 'dex', 'con', 'cha', 'wis', 'int'] as const

describe('DEFAULT_STANDARD_ARRAY', () => {
  it('matches the SRD default six-value pool', () => {
    expect(DEFAULT_STANDARD_ARRAY).toEqual([15, 14, 13, 12, 10, 8])
  })
})

describe('standardArraySchema', () => {
  it('accepts the default array and campaign overrides', () => {
    expect(standardArraySchema.parse([...DEFAULT_STANDARD_ARRAY])).toEqual([15, 14, 13, 12, 10, 8])
    expect(standardArraySchema.parse([18, 16, 14, 12, 10, 8])).toEqual([18, 16, 14, 12, 10, 8])
  })

  it('allows duplicate score values when each is a valid ability score', () => {
    expect(standardArraySchema.parse([15, 14, 14, 12, 10, 8])).toEqual([15, 14, 14, 12, 10, 8])
  })

  it('preserves authored order', () => {
    expect(standardArraySchema.parse([8, 10, 12, 13, 14, 15])).toEqual([8, 10, 12, 13, 14, 15])
  })

  it('rejects arrays that are not exactly six values', () => {
    const result = standardArraySchema.safeParse([15, 14, 13])
    expect(result.success).toBe(false)
    if (result.success) return
    expect(formatFieldMessage(result.error.issues[0]?.message ?? '')).toBe(
      formatFieldMessage(standardArrayValidationMessages.wrongLength()),
    )
  })

  it('rejects invalid ability scores', () => {
    const result = standardArraySchema.safeParse([15, 14, 13, 12, 10, 0])
    expect(result.success).toBe(false)
  })
})

describe('abilityScoreOrderSchema', () => {
  it('accepts a complete permutation of canonical abilities', () => {
    expect(abilityScoreOrderSchema.parse([...FIGHTER_ORDER])).toEqual([...FIGHTER_ORDER])
  })

  it('rejects duplicate abilities', () => {
    const result = abilityScoreOrderSchema.safeParse(['str', 'str', 'con', 'cha', 'wis', 'int'])
    expect(result.success).toBe(false)
    if (result.success) return
    expect(formatFieldMessage(result.error.issues[0]?.message ?? '')).toBe(
      formatFieldMessage(standardArrayValidationMessages.incompleteClassOrder()),
    )
  })

  it('rejects missing abilities', () => {
    const result = abilityScoreOrderSchema.safeParse(['str', 'dex', 'con', 'cha', 'wis', 'wis'])
    expect(result.success).toBe(false)
  })

  it('rejects arrays that are not exactly six abilities', () => {
    expect(abilityScoreOrderSchema.safeParse(['str', 'dex']).success).toBe(false)
  })
})

describe('resolveStandardArrayAssignment', () => {
  it('maps slot values onto ability order by position', () => {
    expect(
      resolveStandardArrayAssignment({
        standardArray: [...DEFAULT_STANDARD_ARRAY],
        abilityScoreOrder: [...FIGHTER_ORDER],
      }),
    ).toEqual({
      str: 15,
      dex: 14,
      con: 13,
      cha: 12,
      wis: 10,
      int: 8,
    })
  })

  it('reflects reordering of ability order without sorting scores', () => {
    expect(
      resolveStandardArrayAssignment({
        standardArray: [...DEFAULT_STANDARD_ARRAY],
        abilityScoreOrder: ['str', 'dex', 'con', 'cha', 'int', 'wis'],
      }),
    ).toEqual({
      str: 15,
      dex: 14,
      con: 13,
      cha: 12,
      int: 10,
      wis: 8,
    })
  })

  it('uses campaign Standard Array overrides with the same ability order', () => {
    expect(
      resolveStandardArrayAssignment({
        standardArray: [18, 16, 14, 12, 10, 8],
        abilityScoreOrder: [...FIGHTER_ORDER],
      }),
    ).toEqual({
      str: 18,
      dex: 16,
      con: 14,
      cha: 12,
      wis: 10,
      int: 8,
    })
  })
})
