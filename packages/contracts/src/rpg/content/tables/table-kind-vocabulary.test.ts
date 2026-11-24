import { describe, expect, it } from 'vitest'

import { GENERAL_TABLE_KIND_ENTRIES, GENERAL_TABLE_KINDS } from './general-table'
import { PROGRESSION_TABLE_KIND_ENTRIES, PROGRESSION_TABLE_KINDS } from './progression-table'

describe('table kind vocabulary', () => {
  it('derives progression table kinds from entries', () => {
    expect(PROGRESSION_TABLE_KINDS).toEqual(['levelProgression'])
    for (const kind of PROGRESSION_TABLE_KINDS) {
      expect(PROGRESSION_TABLE_KIND_ENTRIES[kind].label.length).toBeGreaterThan(0)
      expect(PROGRESSION_TABLE_KIND_ENTRIES[kind].description.length).toBeGreaterThan(0)
    }
  })

  it('derives general table kinds from entries', () => {
    expect(GENERAL_TABLE_KINDS).toEqual(['general'])
    for (const kind of GENERAL_TABLE_KINDS) {
      expect(GENERAL_TABLE_KIND_ENTRIES[kind].label.length).toBeGreaterThan(0)
      expect(GENERAL_TABLE_KIND_ENTRIES[kind].description.length).toBeGreaterThan(0)
    }
  })
})
