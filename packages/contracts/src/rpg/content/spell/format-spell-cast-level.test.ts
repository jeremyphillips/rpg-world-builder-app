import { describe, expect, it } from 'vitest'

import { formatSpellCastAtLevelName, formatSpellCastAtLevelOf } from './format-spell-cast-level'

describe('formatSpellCastAtLevelName', () => {
  it('appends a higher cast level and keeps the spell name otherwise', () => {
    expect(formatSpellCastAtLevelName({ name: 'Fireball', castAtLevel: 5, spellLevel: 3 })).toBe(
      'Fireball (level 5 version)',
    )
    expect(formatSpellCastAtLevelName({ name: 'Fireball', castAtLevel: 3, spellLevel: 3 })).toBe(
      'Fireball',
    )
    expect(formatSpellCastAtLevelName({ name: 'Mage Hand' })).toBe('Mage Hand')
    expect(
      formatSpellCastAtLevelName({ name: '<em>Fireball</em>', castAtLevel: 5, spellLevel: 3 }),
    ).toBe('<em>Fireball</em> (level 5 version)')
  })
})

describe('formatSpellCastAtLevelOf', () => {
  it('names the higher-level version in a casting sentence', () => {
    expect(formatSpellCastAtLevelOf({ castAtLevel: 5, name: 'Magic Missile' })).toBe(
      'the level 5 version of Magic Missile',
    )
    expect(formatSpellCastAtLevelOf({ castAtLevel: 3 })).toBe('the level 3 version of the spell')
    expect(formatSpellCastAtLevelOf({ castAtLevel: 3, name: 'Lightning Bolt' })).toBe(
      'the level 3 version of Lightning Bolt',
    )
  })
})
