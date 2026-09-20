import { describe, expect, it } from 'vitest'

import { isSpellcastingActiveAtLevel, spellcastingSchema } from './spellcasting'

const wizardSelection = {
  model: 'prepareFromLearnedCollection' as const,
  collection: 'spellbook' as const,
  acquisition: {
    curve: { rows: [{ level: 1, count: 6 }] },
    extension: 'zero' as const,
  },
  change: { kind: 'replace' as const, trigger: 'longRest' as const, limit: 'all' as const },
}

describe('spellcastingSchema', () => {
  it('parses class-owned cantrip progression under progression.cantrips', () => {
    const parsed = spellcastingSchema.parse({
      slotProgressionId: 'full-caster',
      ability: 'int',
      spellSelection: wizardSelection,
      progression: {
        cantrips: {
          curve: {
            rows: [
              { level: 1, count: 3 },
              { level: 4, count: 4 },
            ],
          },
        },
        preparedSpells: {
          curve: { rows: [{ level: 1, count: 4 }] },
        },
      },
    })
    expect(parsed.progression?.cantrips?.curve.rows).toEqual([
      { level: 1, count: 3 },
      { level: 4, count: 4 },
    ])
  })

  it('parses slotProgressionId, spellSelection, and ability', () => {
    const parsed = spellcastingSchema.parse({
      slotProgressionId: 'full-caster',
      ability: 'int',
      spellSelection: wizardSelection,
      progression: {
        preparedSpells: {
          curve: { rows: [{ level: 1, count: 4 }] },
        },
      },
    })
    expect(parsed.slotProgressionId).toBe('full-caster')
    expect(parsed.spellSelection?.model).toBe('prepareFromLearnedCollection')
    expect(parsed.ability).toBe('int')
    expect(parsed.level).toBe(1)
  })

  it('parses optional level and description', () => {
    const withLevel = spellcastingSchema.parse({
      slotProgressionId: 'full-caster',
      level: 2,
      ability: 'cha',
      description: '<p>Delayed caster.</p>',
      spellSelection: {
        model: 'limitedRepertoire',
        change: { kind: 'replace', trigger: 'levelUp', limit: 1 },
      },
      progression: {
        repertoire: {
          curve: { rows: [{ level: 1, count: 4 }] },
        },
      },
    })
    expect(withLevel.level).toBe(2)
    expect(withLevel.description).toBe('<p>Delayed caster.</p>')
  })

  it('parses optional focus kinds and rejects non-focus kinds', () => {
    const spellcasting = spellcastingSchema.parse({
      slotProgressionId: 'full-caster',
      ability: 'int',
      spellSelection: wizardSelection,
      progression: {
        preparedSpells: {
          curve: { rows: [{ level: 1, count: 4 }] },
        },
      },
      focusKinds: ['arcane_focus'],
    })
    expect(spellcasting.focusKinds).toEqual(['arcane_focus'])

    expect(
      spellcastingSchema.safeParse({
        slotProgressionId: 'full-caster',
        ability: 'int',
        spellSelection: wizardSelection,
        progression: {
          preparedSpells: {
            curve: { rows: [{ level: 1, count: 4 }] },
          },
        },
        focusKinds: ['spellbook'],
      }).success,
    ).toBe(false)
  })

  it('parses required and recommended spellcasting gear', () => {
    const spellcasting = spellcastingSchema.parse({
      slotProgressionId: 'full-caster',
      ability: 'int',
      spellSelection: wizardSelection,
      progression: {
        preparedSpells: {
          curve: { rows: [{ level: 1, count: 4 }] },
        },
      },
      requiredGear: ['spellbook'],
      focusKinds: ['arcane_focus'],
      recommendedGear: ['component_pouch'],
    })
    expect(spellcasting.requiredGear).toEqual(['spellbook'])
    expect(spellcasting.focusKinds).toEqual(['arcane_focus'])
    expect(spellcasting.recommendedGear).toEqual(['component_pouch'])
  })
})

describe('isSpellcastingActiveAtLevel', () => {
  it('respects unlock level', () => {
    const delayed = spellcastingSchema.parse({
      slotProgressionId: 'half-caster',
      level: 2,
      ability: 'cha',
      spellSelection: {
        model: 'prepareFromClassList',
        change: { kind: 'replace', trigger: 'longRest', limit: 1 },
      },
      progression: {
        preparedSpells: {
          curve: { rows: [{ level: 1, count: 2 }] },
        },
      },
    })
    expect(isSpellcastingActiveAtLevel(delayed, 1)).toBe(false)
    expect(isSpellcastingActiveAtLevel(delayed, 2)).toBe(true)
  })
})
