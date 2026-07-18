import { describe, expect, it } from 'vitest'

import { namingCultureSchema } from '@rpg/contracts/name-generator'

import { STANDALONE_NAMING_CULTURES } from './standalone-cultures'

const SPECIES_CULTURE_IDS = [
  'elven',
  'dwarf',
  'halfling',
  'dragonborn',
  'tiefling',
  'gnome',
  'goliath',
  'orc',
  'human',
] as const

describe('STANDALONE_NAMING_CULTURES', () => {
  it('parses every registry entry against namingCultureSchema', () => {
    for (const culture of STANDALONE_NAMING_CULTURES) {
      expect(namingCultureSchema.safeParse(culture).success).toBe(true)
    }
  })

  it('keeps only standalone cultures outside the species catalog', () => {
    expect(STANDALONE_NAMING_CULTURES.map((culture) => culture.id)).toEqual(['akan'])
    for (const cultureId of SPECIES_CULTURE_IDS as readonly string[]) {
      expect(STANDALONE_NAMING_CULTURES.some((culture) => culture.id === cultureId)).toBe(false)
    }
  })
})
