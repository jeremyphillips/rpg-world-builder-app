import { describe, expect, it } from 'vitest'

import { namingCultureSchema } from '@rpg/contracts/name-generator'

import { NAMING_CULTURES } from './cultures'

describe('NAMING_CULTURES', () => {
  it('parses every registry entry against namingCultureSchema', () => {
    for (const culture of NAMING_CULTURES) {
      expect(namingCultureSchema.safeParse(culture).success).toBe(true)
    }
  })

  it('uses people-centric culture ids', () => {
    expect(NAMING_CULTURES.map((culture) => culture.id)).toEqual([
      'elven',
      'dwarf',
      'halfling',
      'dragonborn',
      'tiefling',
      'gnome',
      'goliath',
      'orc',
      'human',
      'akan',
    ])
  })
})
