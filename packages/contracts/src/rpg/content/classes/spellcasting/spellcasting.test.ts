import { describe, expect, it } from 'vitest'

import { spellcastingSchema } from './spellcasting'
import {
  isSpellcastingActiveAtLevel,
  resolveClassSpellcastingActivationLevel,
} from './class-spellcasting-ownership'

const wizardSelection = {
  model: 'prepareFromLearnedCollection' as const,
  collection: 'spellbook' as const,
  acquisition: {
    curve: { rows: [{ level: 1, count: 6 }] },
    extension: 'zero' as const,
  },
  change: { kind: 'replace' as const, trigger: 'longRest' as const, limit: 'all' as const },
}

const spellcastingGrantFeature = {
  kind: 'custom' as const,
  id: 'spellcasting',
  name: 'Spellcasting',
  level: 1,
  grantGroups: [{ grants: [{ kind: 'spellcasting' as const }] }],
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

  it('parses recommendations', () => {
    const parsed = spellcastingSchema.parse({
      slotProgressionId: 'full-caster',
      ability: 'cha',
      spellSelection: {
        model: 'limitedRepertoire',
        change: { kind: 'replace', trigger: 'levelUp', limit: 1 },
      },
      progression: {
        repertoire: { curve: { rows: [{ level: 1, count: 4 }] } },
      },
      recommendations: [{ target: 'cantrips', classLevel: 1, spellIds: ['dancing-lights'] }],
    })
    expect(parsed.recommendations?.[0]?.target).toBe('cantrips')
  })

  it('rejects limited repertoire with prepared spells progression', () => {
    expect(
      spellcastingSchema.safeParse({
        slotProgressionId: 'full-caster',
        ability: 'cha',
        spellSelection: {
          model: 'limitedRepertoire',
          change: { kind: 'replace', trigger: 'levelUp', limit: 1 },
        },
        progression: {
          repertoire: { curve: { rows: [{ level: 1, count: 4 }] } },
          preparedSpells: { curve: { rows: [{ level: 1, count: 4 }] } },
        },
      }).success,
    ).toBe(false)
  })
})

describe('isSpellcastingActiveAtLevel', () => {
  it('respects granting feature level without rebasing progression curves', () => {
    const source = {
      spellcasting: spellcastingSchema.parse({
        slotProgressionId: 'full-caster',
        ability: 'cha',
        spellSelection: {
          model: 'limitedRepertoire',
          change: { kind: 'replace', trigger: 'levelUp', limit: 1 },
        },
        progression: {
          cantrips: {
            curve: {
              rows: [
                { level: 1, count: 2 },
                { level: 4, count: 3 },
              ],
            },
            extension: 'carryForward',
          },
          repertoire: {
            curve: { rows: [{ level: 1, count: 4 }] },
            extension: 'carryForward',
          },
        },
      }),
      features: [{ ...spellcastingGrantFeature, level: 3 }],
    }

    expect(resolveClassSpellcastingActivationLevel(source)).toBe(3)
    expect(isSpellcastingActiveAtLevel(source, 1)).toBe(false)
    expect(isSpellcastingActiveAtLevel(source, 2)).toBe(false)
    expect(isSpellcastingActiveAtLevel(source, 3)).toBe(true)
  })

  it('is inactive without a granting feature', () => {
    const source = {
      spellcasting: spellcastingSchema.parse({
        slotProgressionId: 'full-caster',
        ability: 'int',
        spellSelection: wizardSelection,
        progression: {
          preparedSpells: { curve: { rows: [{ level: 1, count: 4 }] } },
        },
      }),
      features: [],
    }

    expect(isSpellcastingActiveAtLevel(source, 5)).toBe(false)
  })
})
