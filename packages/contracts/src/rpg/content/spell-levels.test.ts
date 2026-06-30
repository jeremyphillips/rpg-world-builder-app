import { describe, expect, it } from 'vitest'

import { formatSpellLevel, spellLevelSchema, SPELL_LEVELS } from './spell-levels'

describe('SPELL_LEVELS', () => {
  it('covers spell levels 1 through 9', () => {
    expect(SPELL_LEVELS).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9])
  })
})

describe('spellLevelSchema', () => {
  it('accepts levels 1–9 and rejects cantrip or 10th-level slots', () => {
    expect(spellLevelSchema.safeParse(1).success).toBe(true)
    expect(spellLevelSchema.safeParse(9).success).toBe(true)
    expect(spellLevelSchema.safeParse(0).success).toBe(false)
    expect(spellLevelSchema.safeParse(10).success).toBe(false)
  })
})

describe('formatSpellLevel', () => {
  it('formats ordinals for spell slot headers', () => {
    expect(formatSpellLevel(1)).toBe('1st')
    expect(formatSpellLevel(2)).toBe('2nd')
    expect(formatSpellLevel(3)).toBe('3rd')
    expect(formatSpellLevel(4)).toBe('4th')
    expect(formatSpellLevel(9)).toBe('9th')
  })
})
