import { describe, expect, it } from 'vitest'

import { REACH_FEET, reachFeetSchema } from './melee-reach'

describe('reachFeetSchema', () => {
  it('accepts preset reach values', () => {
    for (const feet of REACH_FEET) {
      expect(reachFeetSchema.parse(feet)).toBe(feet)
    }
  })

  it('rejects values outside the preset ladder', () => {
    expect(reachFeetSchema.safeParse(7).success).toBe(false)
    expect(reachFeetSchema.safeParse(35).success).toBe(false)
  })
})
