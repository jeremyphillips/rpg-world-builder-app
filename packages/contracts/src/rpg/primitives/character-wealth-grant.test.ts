import { describe, expect, it } from 'vitest'

import {
  characterWealthGrantsEqual,
  normalizeCharacterWealthGrant,
  normalizeWealthTierGrant,
} from './character-wealth-grant'

describe('normalizeWealthTierGrant', () => {
  it('keeps an explicit zero as gp: 0', () => {
    expect(normalizeWealthTierGrant({ gp: 0 })).toEqual({ gp: 0 })
    expect(normalizeWealthTierGrant({ cp: 0, gp: 0 })).toEqual({ cp: 0 })
  })

  it('keeps positive sparse grants', () => {
    expect(normalizeWealthTierGrant({ gp: 10, cp: 0 })).toEqual({ gp: 10 })
  })
})

describe('characterWealthGrantsEqual', () => {
  it('treats explicit zero and absent denominations as different', () => {
    expect(characterWealthGrantsEqual({ gp: 0 }, { gp: 10 })).toBe(false)
    expect(characterWealthGrantsEqual({ gp: 0 }, undefined)).toBe(false)
    expect(characterWealthGrantsEqual(undefined, undefined)).toBe(true)
  })

  it('matches normalizeCharacterWealthGrant positive shapes', () => {
    expect(
      characterWealthGrantsEqual(normalizeCharacterWealthGrant({ gp: 10, cp: 0 }), { gp: 10 }),
    ).toBe(true)
  })
})
