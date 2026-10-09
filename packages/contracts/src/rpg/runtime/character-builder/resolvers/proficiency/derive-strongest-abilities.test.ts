import { describe, expect, it } from 'vitest'

import { deriveStrongestAbilities } from './derive-strongest-abilities'

describe('deriveStrongestAbilities', () => {
  it('returns abilities tied for the highest positive modifier', () => {
    expect(
      deriveStrongestAbilities({ str: 8, dex: 15, con: 10, int: 12, wis: 14, cha: 10 }),
    ).toEqual(new Set(['dex', 'wis']))
  })

  it('returns an empty set when the highest modifier is not positive', () => {
    expect(deriveStrongestAbilities({ str: 10, dex: 11, con: 8, int: 9, wis: 8, cha: 10 })).toEqual(
      new Set(),
    )
    expect(deriveStrongestAbilities({ str: 8, dex: 9, con: 8, int: 8, wis: 8, cha: 8 })).toEqual(
      new Set(),
    )
  })

  it('returns an empty set when scores are unset', () => {
    expect(deriveStrongestAbilities(undefined)).toEqual(new Set())
    expect(deriveStrongestAbilities({})).toEqual(new Set())
  })

  it('ignores unset abilities and keeps a single positive leader', () => {
    expect(deriveStrongestAbilities({ dex: 16 })).toEqual(new Set(['dex']))
  })
})
