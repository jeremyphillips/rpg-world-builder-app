import { describe, expect, it } from 'vitest'

import type { AbilitiesFormValues } from './abilities-form-fields'
import { abilitiesFormValuesToDraft, areAbilitiesDraftsEqual } from './abilities-form-values'

describe('areAbilitiesDraftsEqual', () => {
  it('compares method and scores', () => {
    expect(
      areAbilitiesDraftsEqual(
        { method: 'standard-array', scores: { str: 15 } },
        { method: 'standard-array', scores: { str: 15 } },
      ),
    ).toBe(true)

    expect(
      areAbilitiesDraftsEqual(
        { method: 'standard-array', scores: { str: 15 } },
        { method: 'manual', scores: { str: 15 } },
      ),
    ).toBe(false)
  })
})

describe('abilitiesFormValuesToDraft', () => {
  it('coerces select string scores into numeric draft values', () => {
    expect(
      abilitiesFormValuesToDraft({
        method: 'standard-array',
        str: '15',
        dex: '14',
        con: '13',
        int: '12',
        wis: '10',
        cha: '8',
      } as unknown as AbilitiesFormValues),
    ).toEqual({
      method: 'standard-array',
      scores: { str: 15, dex: 14, con: 13, int: 12, wis: 10, cha: 8 },
    })
  })
})
