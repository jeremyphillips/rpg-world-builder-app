import { describe, expect, it } from 'vitest'

import {
  SPELL_GRANT_AVAILABILITIES,
  getSpellGrantAvailabilityLabel,
  spellGrantAvailabilitySchema,
} from './grant-availability'
import { spellGrantCastingSchema } from './grant-casting'

describe('spellGrantAvailabilitySchema', () => {
  it('accepts every known availability value', () => {
    for (const availability of SPELL_GRANT_AVAILABILITIES) {
      expect(spellGrantAvailabilitySchema.parse(availability)).toBe(availability)
    }
  })

  it('rejects unknown availability values', () => {
    expect(spellGrantAvailabilitySchema.safeParse('known').success).toBe(false)
  })

  it('returns labels and falls back for unknown ids', () => {
    expect(getSpellGrantAvailabilityLabel('always_prepared')).toBe('Always prepared')
    expect(getSpellGrantAvailabilityLabel('custom')).toBe('custom')
  })
})

describe('spellGrantCastingSchema', () => {
  it('parses at-will casting without a limited use', () => {
    expect(spellGrantCastingSchema.parse({ mode: 'free_cast' })).toEqual({ mode: 'free_cast' })
  })

  it('parses optional allowsSlotCasting', () => {
    expect(
      spellGrantCastingSchema.parse({
        mode: 'free_cast',
        limitedUse: {
          kind: 'uses',
          count: { kind: 'fixed', value: 1 },
          recovery: { minimumRest: 'long' },
        } as const,
        allowsSlotCasting: true,
      }),
    ).toEqual({
      mode: 'free_cast',
      limitedUse: {
        kind: 'uses',
        count: { kind: 'fixed', value: 1 },
        recovery: { minimumRest: 'long' },
      } as const,
      allowsSlotCasting: true,
    })
  })

  it('rejects recharge as a grant cadence', () => {
    expect(
      spellGrantCastingSchema.safeParse({
        mode: 'free_cast',
        limitedUse: { kind: 'recharge', minRoll: 5 },
      }).success,
    ).toBe(false)
  })
})
