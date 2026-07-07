import { describe, expect, it } from 'vitest'

import type { CharacterDerivedSpellcasting } from '@rpg/contracts'

import {
  formatSpellAttackBonus,
  formatSpellSaveDc,
  formatSpellSelectionCounter,
  formatSpellSlotSummary,
  isSpellChoiceSetFull,
} from './spells-step.lib'

describe('spells-step.lib', () => {
  it('formats selection counters and full state', () => {
    expect(formatSpellSelectionCounter(2, 3)).toBe('Selected: 2 / 3')
    expect(isSpellChoiceSetFull({ max: 2 } as never, ['a', 'b'])).toBe(true)
  })

  it('shows pending ability labels when preview stats are incomplete', () => {
    expect(formatSpellSaveDc(null)).toBe('Pending ability scores')
    expect(
      formatSpellAttackBonus({ ability: 'int', saveDc: 13, attackBonus: undefined, slots: [] }),
    ).toBe('Pending ability scores')
  })

  it('formats derived spellcasting stats when present', () => {
    const spellcasting: CharacterDerivedSpellcasting = {
      ability: 'int',
      saveDc: 13,
      attackBonus: 5,
      slots: [2, 0, 0, 0, 0, 0, 0, 0, 0],
    }

    expect(formatSpellSaveDc(spellcasting)).toBe('13')
    expect(formatSpellAttackBonus(spellcasting)).toBe('+5')
    expect(formatSpellSlotSummary(spellcasting)).toBe('1st: 2')
  })
})
