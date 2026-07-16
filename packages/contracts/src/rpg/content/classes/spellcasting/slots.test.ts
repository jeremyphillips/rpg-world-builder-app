import { describe, expect, it } from 'vitest'

import { getSlotRow, FULL_CASTER_SLOTS } from './slots'

describe('getSlotRow', () => {
  it('returns the row for a valid level', () => {
    expect(getSlotRow(FULL_CASTER_SLOTS, 1)).toEqual([2])
    expect(getSlotRow(FULL_CASTER_SLOTS, 20)).toEqual(FULL_CASTER_SLOTS[19])
  })

  it('extrapolates epic levels beyond the canonical table', () => {
    expect(getSlotRow(FULL_CASTER_SLOTS, 25)).toEqual(FULL_CASTER_SLOTS[19])
  })
})
