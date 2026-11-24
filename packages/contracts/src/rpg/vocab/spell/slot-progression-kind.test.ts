import { describe, expect, it } from 'vitest'

import { SLOT_PROGRESSION_KIND_ENTRIES, SLOT_PROGRESSION_KIND_IDS } from './slot-progression-kind'

describe('slot progression kind vocabulary', () => {
  it('derives ids from entries in builder order', () => {
    expect(SLOT_PROGRESSION_KIND_IDS).toEqual(['full-caster', 'half-caster', 'pact-magic'])
    for (const id of SLOT_PROGRESSION_KIND_IDS) {
      expect(SLOT_PROGRESSION_KIND_ENTRIES[id].label.length).toBeGreaterThan(0)
      expect(SLOT_PROGRESSION_KIND_ENTRIES[id].description.length).toBeGreaterThan(0)
    }
  })
})
