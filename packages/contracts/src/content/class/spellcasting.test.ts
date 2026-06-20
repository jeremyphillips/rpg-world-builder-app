import { describe, expect, it } from 'vitest'

import {
  SPELL_PREPARATION_MODE_LABELS,
  SPELL_PREPARATION_MODES,
  spellcastingSchema,
  spellsAvailableEntrySchema,
} from './spellcasting'

describe('SPELL_PREPARATION_MODES', () => {
  it('derives mode ids from the label map', () => {
    expect([...SPELL_PREPARATION_MODES].sort()).toEqual(
      Object.keys(SPELL_PREPARATION_MODE_LABELS).sort(),
    )
  })
})

describe('spellcastingSchema', () => {
  it('parses all preparation modes including always_prepared', () => {
    for (const preparation of SPELL_PREPARATION_MODES) {
      expect(
        spellcastingSchema.safeParse({
          progression: 'full',
          ability: 'int',
          preparation,
        }).success,
      ).toBe(true)
    }
  })

  it('parses spellsAvailable with count instead of prepared', () => {
    const spellcasting = spellcastingSchema.parse({
      progression: 'full',
      ability: 'int',
      preparation: 'prepared',
      spellsAvailable: [{ level: 1, count: 4 }],
    })

    expect(spellcasting.spellsAvailable).toEqual([{ level: 1, count: 4 }])
  })

  it('strips legacy spellsPrepared field on parse', () => {
    const result = spellcastingSchema.parse({
      progression: 'full',
      ability: 'int',
      preparation: 'prepared',
      spellsPrepared: [{ level: 1, prepared: 4 }],
    })

    expect(result.spellsAvailable).toBeUndefined()
    expect('spellsPrepared' in result).toBe(false)
  })
})

describe('spellsAvailableEntrySchema', () => {
  it('requires count, not prepared', () => {
    expect(spellsAvailableEntrySchema.safeParse({ level: 1, count: 2 }).success).toBe(true)
    expect(spellsAvailableEntrySchema.safeParse({ level: 1, prepared: 2 }).success).toBe(false)
  })
})
