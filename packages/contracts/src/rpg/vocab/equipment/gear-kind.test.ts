import { describe, expect, it } from 'vitest'

import { GEAR_KIND_ENTRIES, GEAR_KINDS, gearKindSchema } from './gear-kind'

describe('gearKindSchema', () => {
  it('matches GEAR_KINDS', () => {
    expect(gearKindSchema.options).toEqual([...GEAR_KINDS])
  })

  it('has a non-empty label for every kind', () => {
    for (const kind of GEAR_KINDS) {
      expect(GEAR_KIND_ENTRIES[kind].label.length).toBeGreaterThan(0)
    }
  })
})
