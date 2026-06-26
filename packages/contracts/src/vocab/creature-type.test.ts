import { describe, expect, it } from 'vitest'

import { CREATURE_TYPE_SET_ID, creatureTypeSchema } from './creature-type'

describe('creatureTypeSchema', () => {
  it('accepts slug-shaped ids including campaign custom terms', () => {
    expect(creatureTypeSchema.parse('humanoid')).toBe('humanoid')
    expect(creatureTypeSchema.parse('custom-robot')).toBe('custom-robot')
  })

  it('rejects invalid slug shapes', () => {
    expect(creatureTypeSchema.safeParse('Bad Slug').success).toBe(false)
    expect(creatureTypeSchema.safeParse('humanoid').success).toBe(true)
  })
})

describe('creature type vocabulary', () => {
  it('registers the creature type option set id', () => {
    expect(CREATURE_TYPE_SET_ID).toBe('creature-types')
  })
})
