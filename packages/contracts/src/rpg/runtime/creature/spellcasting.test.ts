import { describe, expect, it } from 'vitest'

import { spellcastingProgressionTestConfig } from '../../campaign/rules/spellcasting-progression/fixtures'
import { warlockClass, wizardClass } from '../character-builder/spellcasting-test-fixtures'
// spellcastingProgressionTestConfig still used by maxSelectableSpellLevel / spellsAvailableAtLevel
import {
  cantripsKnownAtLevel,
  maxSelectableSpellLevel,
  resolveSpellcastingFactsAtLevel,
  spellsAvailableAtLevel,
} from './spellcasting'

describe('cantripsKnownAtLevel', () => {
  it('reads the best known count at or below the class level', () => {
    expect(cantripsKnownAtLevel(wizardClass.spellcasting!, 1)).toBe(3)
  })
})

describe('spellsAvailableAtLevel', () => {
  it('reads the best available count at or below the class level', () => {
    expect(
      spellsAvailableAtLevel(wizardClass.spellcasting!, 1, spellcastingProgressionTestConfig),
    ).toBe(4)
  })
})

describe('maxSelectableSpellLevel', () => {
  it('returns the highest spell level with at least one slot', () => {
    expect(
      maxSelectableSpellLevel(wizardClass.spellcasting!, 1, spellcastingProgressionTestConfig),
    ).toBe(1)
    expect(
      maxSelectableSpellLevel(warlockClass.spellcasting!, 1, spellcastingProgressionTestConfig),
    ).toBe(1)
  })
})

describe('resolveSpellcastingFactsAtLevel', () => {
  it('combines progression facts for a class level', () => {
    expect(
      resolveSpellcastingFactsAtLevel(
        wizardClass.spellcasting!,
        1,
        spellcastingProgressionTestConfig,
      ),
    ).toEqual({
      cantripsKnown: 3,
      spellsAvailable: 4,
      maxSelectableSpellLevel: 1,
    })
  })
})
