import { describe, expect, it } from 'vitest'

import {
  CREATURE_TYPES,
  CREATURE_TYPE_ENTRIES,
  creatureTypeSchema,
  getCreatureTypeEntry,
  getCreatureTypeLabel,
} from './creature-type'

describe('creatureTypeSchema', () => {
  it('accepts every known creature type', () => {
    for (const type of CREATURE_TYPES) {
      expect(creatureTypeSchema.parse(type)).toBe(type)
    }
  })

  it('rejects unknown creature types', () => {
    expect(creatureTypeSchema.safeParse('robot').success).toBe(false)
    expect(creatureTypeSchema.safeParse('humanoid').success).toBe(true)
  })
})

describe('creature type vocabulary', () => {
  it('derives CREATURE_TYPES from the entry map', () => {
    expect([...CREATURE_TYPES].sort()).toEqual(Object.keys(CREATURE_TYPE_ENTRIES).sort())
  })

  it('has a label and description for every type', () => {
    for (const type of CREATURE_TYPES) {
      const entry = getCreatureTypeEntry(type)
      expect(entry?.label).toBeTruthy()
      expect(entry?.description).toBeTruthy()
    }
  })

  it('returns labels and falls back for unknown ids', () => {
    expect(getCreatureTypeLabel('humanoid')).toBe('Humanoid')
    expect(getCreatureTypeLabel('custom')).toBe('custom')
  })
})
