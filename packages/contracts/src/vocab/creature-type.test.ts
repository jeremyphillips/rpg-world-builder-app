import { describe, expect, it } from 'vitest'

import {
  CREATURE_TYPES,
  CREATURE_TYPE_ENTRIES,
  CREATURE_TYPE_SET_ID,
  creatureTypeSchema,
  getCreatureTypeEntry,
  getCreatureTypeLabel,
} from './creature-type'

describe('creatureTypeSchema', () => {
  it('accepts slug-shaped ids including campaign custom terms', () => {
    for (const type of CREATURE_TYPES) {
      expect(creatureTypeSchema.parse(type)).toBe(type)
    }
    expect(creatureTypeSchema.parse('custom-robot')).toBe('custom-robot')
  })

  it('rejects invalid slug shapes', () => {
    expect(creatureTypeSchema.safeParse('Bad Slug').success).toBe(false)
    expect(creatureTypeSchema.safeParse('humanoid').success).toBe(true)
  })
})

describe('creature type vocabulary', () => {
  it('derives CREATURE_TYPES from the entry map', () => {
    expect([...CREATURE_TYPES].sort()).toEqual(Object.keys(CREATURE_TYPE_ENTRIES).sort())
  })

  it('registers the creature type option set id', () => {
    expect(CREATURE_TYPE_SET_ID).toBe('creature-types')
  })

  it('has a label and description for every system seed type', () => {
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
