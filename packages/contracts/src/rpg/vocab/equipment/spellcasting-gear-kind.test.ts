import { describe, expect, it } from 'vitest'

import {
  SPELLCASTING_FOCUS_GEAR_KINDS,
  SPELLCASTING_GEAR_KIND_ENTRIES,
  SPELLCASTING_GEAR_KINDS,
  isSpellcastingFocusGearKind,
  isSpellcastingGearKind,
  spellcastingGearKindSchema,
} from './spellcasting-gear-kind'

describe('spellcastingGearKindSchema', () => {
  it('matches SPELLCASTING_GEAR_KINDS', () => {
    expect(spellcastingGearKindSchema.options).toEqual([...SPELLCASTING_GEAR_KINDS])
  })

  it('has a non-empty label for every kind', () => {
    for (const kind of SPELLCASTING_GEAR_KINDS) {
      expect(SPELLCASTING_GEAR_KIND_ENTRIES[kind].label.length).toBeGreaterThan(0)
    }
  })
})

describe('isSpellcastingFocusGearKind', () => {
  it('identifies focus sub-kinds only', () => {
    for (const kind of SPELLCASTING_FOCUS_GEAR_KINDS) {
      expect(isSpellcastingFocusGearKind(kind)).toBe(true)
    }
    expect(isSpellcastingFocusGearKind('spellbook')).toBe(false)
    expect(isSpellcastingFocusGearKind('general')).toBe(false)
  })
})

describe('isSpellcastingGearKind', () => {
  it('includes spellbook', () => {
    expect(isSpellcastingGearKind('spellbook')).toBe(true)
  })
})
