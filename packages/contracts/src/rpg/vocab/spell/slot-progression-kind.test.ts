import { describe, expect, it } from 'vitest'

import {
  getSlotProgressionKindEntry,
  isSlotProgressionKindId,
  SLOT_PROGRESSION_KIND_ENTRIES,
} from './slot-progression-kind'

describe('slot-progression-kind', () => {
  it('recognizes the three standard progression ids', () => {
    expect(isSlotProgressionKindId('full-caster')).toBe(true)
    expect(isSlotProgressionKindId('half-caster')).toBe(true)
    expect(isSlotProgressionKindId('pact-magic')).toBe(true)
    expect(isSlotProgressionKindId('custom-table')).toBe(false)
  })

  it('returns descriptions for standard ids', () => {
    for (const id of ['full-caster', 'half-caster', 'pact-magic'] as const) {
      expect(getSlotProgressionKindEntry(id)).toEqual(SLOT_PROGRESSION_KIND_ENTRIES[id])
    }
    expect(getSlotProgressionKindEntry('custom-table')).toBeUndefined()
  })

  it('uses Pact Magic capitalization', () => {
    expect(SLOT_PROGRESSION_KIND_ENTRIES['pact-magic'].label).toBe('Pact Magic')
  })
})
