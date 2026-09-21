import { describe, expect, it } from 'vitest'

import { createClassInputSchema } from '../class'
import {
  isClassSpellcastingGrantingFeature,
  resolveClassSpellcastingFeature,
} from './class-spellcasting-ownership'

const minimalClassBody = {
  name: 'Test Caster',
  primaryAbilities: ['int'],
  hitDie: 6,
  proficiencies: {
    savingThrows: ['int', 'wis'],
    armor: { categories: [], items: [] },
    weapons: { categories: ['simple'], items: [] },
    skills: { categories: [], items: ['arcana'] },
  },
  features: [
    {
      kind: 'custom' as const,
      id: 'spellcasting',
      name: 'Spellcasting',
      level: 1,
      grantGroups: [{ grants: [{ kind: 'spellcasting' as const }] }],
    },
  ],
}

describe('class spellcasting publish invariants', () => {
  it('accepts config with exactly one dedicated granting feature', () => {
    expect(
      createClassInputSchema.safeParse({
        slug: 'test-caster',
        ...minimalClassBody,
        spellcasting: {
          slotProgressionId: 'full-caster',
          ability: 'int',
          spellSelection: {
            model: 'limitedRepertoire',
            change: { kind: 'replace', trigger: 'levelUp', limit: 1 },
          },
          progression: {
            repertoire: { curve: { rows: [{ level: 1, count: 4 }] } },
          },
        },
      }).success,
    ).toBe(true)
  })

  it('rejects config without a granting feature', () => {
    expect(
      createClassInputSchema.safeParse({
        slug: 'test-caster',
        ...minimalClassBody,
        features: [],
        spellcasting: {
          slotProgressionId: 'full-caster',
          ability: 'int',
          spellSelection: {
            model: 'limitedRepertoire',
            change: { kind: 'replace', trigger: 'levelUp', limit: 1 },
          },
          progression: {
            repertoire: { curve: { rows: [{ level: 1, count: 4 }] } },
          },
        },
      }).success,
    ).toBe(false)
  })
})

describe('isClassSpellcastingGrantingFeature', () => {
  it('recognizes dedicated managed features', () => {
    expect(isClassSpellcastingGrantingFeature(minimalClassBody.features[0]!)).toBe(true)
  })

  it('rejects sibling grants', () => {
    expect(
      isClassSpellcastingGrantingFeature({
        grantGroups: [
          {
            grants: [{ kind: 'spellcasting' }, { kind: 'languages', languageIds: ['common'] }],
          },
        ],
      }),
    ).toBe(false)
  })
})

describe('resolveClassSpellcastingFeature', () => {
  it('filters unavailable features at runtime', () => {
    const feature = resolveClassSpellcastingFeature(
      {
        features: [{ ...minimalClassBody.features[0]!, available: false }],
      },
      { runtime: true },
    )
    expect(feature).toBeUndefined()
  })
})
