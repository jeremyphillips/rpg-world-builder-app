import { describe, expect, it } from 'vitest'

import {
  CREATURE_TYPE_SET_ID,
  creatureTypeSchema,
  creatureTypeSeedOptionSchema,
} from './creature-type'

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

describe('creatureTypeSeedOptionSchema', () => {
  const base = {
    id: 'dragon',
    label: 'Dragon',
    description: 'Dragons.',
  } as const

  it('parses optional language affinities', () => {
    expect(
      creatureTypeSeedOptionSchema.parse({ ...base, languageAffinities: ['draconic'] })
        .languageAffinities,
    ).toEqual(['draconic'])
  })

  it('rejects invalid language ids', () => {
    expect(
      creatureTypeSeedOptionSchema.safeParse({ ...base, languageAffinities: ['Not Valid'] })
        .success,
    ).toBe(false)
  })
})
