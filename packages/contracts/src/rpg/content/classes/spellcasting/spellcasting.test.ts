import { describe, expect, it } from 'vitest'

import {
  SPELL_PREPARATION_MODE_LABELS,
  SPELL_PREPARATION_MODES,
  isSpellcastingActiveAtLevel,
  spellcastingFeatureLabel,
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

  it('parses optional level and description', () => {
    const withDefaults = spellcastingSchema.parse({
      progression: 'half',
      ability: 'cha',
      preparation: 'prepared',
    })
    expect(withDefaults.level).toBe(1)

    const withLevel = spellcastingSchema.parse({
      level: 2,
      progression: 'half',
      ability: 'cha',
      preparation: 'prepared',
      description: '<p>Delayed caster.</p>',
    })
    expect(withLevel.level).toBe(2)
    expect(withLevel.description).toBe('<p>Delayed caster.</p>')
  })

  it('parses optional focus kinds and rejects non-focus kinds', () => {
    const spellcasting = spellcastingSchema.parse({
      progression: 'full',
      ability: 'int',
      preparation: 'prepared',
      focusKinds: ['arcane_focus'],
    })
    expect(spellcasting.focusKinds).toEqual(['arcane_focus'])

    expect(
      spellcastingSchema.safeParse({
        progression: 'full',
        ability: 'int',
        preparation: 'prepared',
        focusKinds: ['spellbook'],
      }).success,
    ).toBe(false)
  })

  it('parses required and recommended spellcasting gear', () => {
    const spellcasting = spellcastingSchema.parse({
      progression: 'full',
      ability: 'int',
      preparation: 'prepared',
      requiredGear: ['spellbook'],
      focusKinds: ['arcane_focus'],
      recommendedGear: ['spellbook'],
    })
    expect(spellcasting.requiredGear).toEqual(['spellbook'])
    expect(spellcasting.focusKinds).toEqual(['arcane_focus'])
    expect(spellcasting.recommendedGear).toEqual(['spellbook'])
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

describe('spellcastingFeatureLabel', () => {
  it('returns Pact Magic for pact progression', () => {
    expect(spellcastingFeatureLabel('pact')).toBe('Pact Magic')
    expect(spellcastingFeatureLabel('full')).toBe('Spellcasting')
  })
})

describe('isSpellcastingActiveAtLevel', () => {
  it('respects unlock level', () => {
    const half = spellcastingSchema.parse({
      level: 2,
      progression: 'half',
      ability: 'cha',
      preparation: 'prepared',
    })
    expect(isSpellcastingActiveAtLevel(half, 1)).toBe(false)
    expect(isSpellcastingActiveAtLevel(half, 2)).toBe(true)
  })
})

describe('spellsAvailableEntrySchema', () => {
  it('requires count, not prepared', () => {
    expect(spellsAvailableEntrySchema.safeParse({ level: 1, count: 2 }).success).toBe(true)
    expect(spellsAvailableEntrySchema.safeParse({ level: 1, prepared: 2 }).success).toBe(false)
  })
})
