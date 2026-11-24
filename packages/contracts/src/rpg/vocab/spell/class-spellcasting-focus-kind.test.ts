import { describe, expect, it } from 'vitest'

import {
  CLASS_SPELLCASTING_FOCUS_KINDS,
  CLASS_SPELLCASTING_FOCUS_KIND_ENTRIES,
  getClassSpellcastingFocusKindLabel,
  isClassSpellcastingFocusKind,
} from './class-spellcasting-focus-kind'
import { SPELLCASTING_GEAR_KIND_ENTRIES } from '../equipment/spellcasting-gear-kind'
import { TOOL_CATEGORY_ENTRIES } from '../equipment/tool-category'

describe('CLASS_SPELLCASTING_FOCUS_KIND_ENTRIES', () => {
  it('matches closed vocabulary ids', () => {
    expect(CLASS_SPELLCASTING_FOCUS_KINDS).toEqual([
      'arcane_focus',
      'druidic_focus',
      'holy_symbol',
      'spellbook',
      'musical_instrument',
    ])
  })

  it('reuses gear and tool labels without copying', () => {
    expect(CLASS_SPELLCASTING_FOCUS_KIND_ENTRIES.arcane_focus.label).toBe(
      SPELLCASTING_GEAR_KIND_ENTRIES.arcane_focus.label,
    )
    expect(CLASS_SPELLCASTING_FOCUS_KIND_ENTRIES.musical_instrument.label).toBe(
      TOOL_CATEGORY_ENTRIES.musical_instrument.label,
    )
    expect(CLASS_SPELLCASTING_FOCUS_KIND_ENTRIES.spellbook.focusDeterminer).toBe('possessive')
  })

  it('identifies known focus kinds', () => {
    for (const kind of CLASS_SPELLCASTING_FOCUS_KINDS) {
      expect(isClassSpellcastingFocusKind(kind)).toBe(true)
      expect(getClassSpellcastingFocusKindLabel(kind).length).toBeGreaterThan(0)
    }
    expect(isClassSpellcastingFocusKind('component_pouch')).toBe(false)
  })
})
