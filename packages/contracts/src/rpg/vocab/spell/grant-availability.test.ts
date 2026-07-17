import { describe, expect, it } from 'vitest'

import {
  SPELL_GRANT_AVAILABILITY_ENTRIES,
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

  it('derives enum keys from the entry map', () => {
    expect([...SPELL_GRANT_AVAILABILITIES].sort()).toEqual(
      Object.keys(SPELL_GRANT_AVAILABILITY_ENTRIES).sort(),
    )
  })

  it('returns labels and falls back for unknown ids', () => {
    expect(getSpellGrantAvailabilityLabel('always_prepared')).toBe('Always prepared')
    expect(getSpellGrantAvailabilityLabel('custom')).toBe('custom')
  })
})

describe('spellGrantCastingSchema', () => {
  it('parses a free-cast entitlement with frequency', () => {
    expect(
      spellGrantCastingSchema.parse({
        mode: 'free_cast',
        frequency: 'at_will',
      }),
    ).toEqual({
      mode: 'free_cast',
      frequency: 'at_will',
    })
  })

  it('parses optional allowsSlotCasting', () => {
    expect(
      spellGrantCastingSchema.parse({
        mode: 'free_cast',
        frequency: 'once_per_long_rest',
        allowsSlotCasting: true,
      }),
    ).toEqual({
      mode: 'free_cast',
      frequency: 'once_per_long_rest',
      allowsSlotCasting: true,
    })
  })

  it('rejects missing frequency', () => {
    expect(spellGrantCastingSchema.safeParse({ mode: 'free_cast' }).success).toBe(false)
  })
})
