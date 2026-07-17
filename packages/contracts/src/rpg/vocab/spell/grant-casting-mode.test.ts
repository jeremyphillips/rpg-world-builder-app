import { describe, expect, it } from 'vitest'

import {
  SPELL_GRANT_CASTING_MODE_ENTRIES,
  SPELL_GRANT_CASTING_MODES,
  getSpellGrantCastingModeLabel,
  spellGrantCastingModeSchema,
} from './grant-casting-mode'

describe('spellGrantCastingModeSchema', () => {
  it('accepts every known casting mode', () => {
    for (const mode of SPELL_GRANT_CASTING_MODES) {
      expect(spellGrantCastingModeSchema.parse(mode)).toBe(mode)
    }
  })

  it('rejects unknown casting modes', () => {
    expect(spellGrantCastingModeSchema.safeParse('innate').success).toBe(false)
  })

  it('derives enum keys from the entry map', () => {
    expect([...SPELL_GRANT_CASTING_MODES].sort()).toEqual(
      Object.keys(SPELL_GRANT_CASTING_MODE_ENTRIES).sort(),
    )
  })

  it('has a label and description for every casting mode', () => {
    for (const mode of SPELL_GRANT_CASTING_MODES) {
      const entry = SPELL_GRANT_CASTING_MODE_ENTRIES[mode]
      expect(entry.label).toBeTruthy()
      expect(entry.description).toBeTruthy()
    }
  })

  it('returns labels and falls back for unknown ids', () => {
    expect(getSpellGrantCastingModeLabel('free_cast')).toBe('Free cast')
    expect(getSpellGrantCastingModeLabel('custom')).toBe('custom')
  })
})
