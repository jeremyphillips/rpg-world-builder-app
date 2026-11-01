import { describe, expect, it } from 'vitest'

import { monsterLimitRechargesOnHint } from '../monster-form-labels'

describe('monsterLimitRechargesOnHint', () => {
  it('reflects the recharge threshold in the recharges-on clause', () => {
    expect(monsterLimitRechargesOnHint(5)).toBe(
      'Roll a d6 at the start of each turn. Recharges on 5–6.',
    )
    expect(monsterLimitRechargesOnHint('5')).toBe(
      'Roll a d6 at the start of each turn. Recharges on 5–6.',
    )
    expect(monsterLimitRechargesOnHint(2)).toBe(
      'Roll a d6 at the start of each turn. Recharges on 2–6.',
    )
    expect(monsterLimitRechargesOnHint(6)).toBe(
      'Roll a d6 at the start of each turn. Recharges on 6.',
    )
  })

  it('uses a placeholder range when the threshold is unset', () => {
    expect(monsterLimitRechargesOnHint(undefined)).toBe(
      'Roll a d6 at the start of each turn. Recharges on …–6.',
    )
  })
})
