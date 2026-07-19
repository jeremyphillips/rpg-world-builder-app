import { describe, expect, it } from 'vitest'

import { resolveCreatureInitiativeModifier } from './initiative'

describe('resolveCreatureInitiativeModifier', () => {
  it('returns the DEX ability modifier', () => {
    expect(resolveCreatureInitiativeModifier(10)).toBe(0)
    expect(resolveCreatureInitiativeModifier(14)).toBe(2)
    expect(resolveCreatureInitiativeModifier(8)).toBe(-1)
  })
})
