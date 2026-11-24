import { describe, expect, it } from 'vitest'

import { createClassInputSchema } from '../class'
import {
  isSpellcastingClassFeature,
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
      kind: 'spellcasting' as const,
      id: 'spellcasting',
      name: 'Spellcasting',
      level: 1,
    },
  ],
}

const fullCasterSpellcasting = {
  slotProgressionId: 'full-caster',
  ability: 'int',
  spellSelection: {
    model: 'limitedRepertoire' as const,
    change: { kind: 'replace' as const, trigger: 'levelUp' as const, limit: 1 },
  },
  progression: {
    repertoire: { curve: { rows: [{ level: 1, count: 4 }] } },
  },
}

describe('class spellcasting publish invariants', () => {
  it('accepts config with exactly one spellcasting feature', () => {
    expect(
      createClassInputSchema.safeParse({
        slug: 'test-caster',
        ...minimalClassBody,
        spellcasting: fullCasterSpellcasting,
      }).success,
    ).toBe(true)
  })

  it('rejects config without a spellcasting feature', () => {
    expect(
      createClassInputSchema.safeParse({
        slug: 'test-caster',
        ...minimalClassBody,
        features: [],
        spellcasting: fullCasterSpellcasting,
      }).success,
    ).toBe(false)
  })

  it('rejects a spellcasting feature without config', () => {
    expect(
      createClassInputSchema.safeParse({
        slug: 'test-caster',
        ...minimalClassBody,
      }).success,
    ).toBe(false)
  })
})

describe('isSpellcastingClassFeature', () => {
  it('recognizes spellcasting kind', () => {
    expect(isSpellcastingClassFeature(minimalClassBody.features[0]!)).toBe(true)
  })
})

describe('resolveClassSpellcastingFeature', () => {
  it('returns the spellcasting feature row', () => {
    expect(resolveClassSpellcastingFeature(minimalClassBody)?.id).toBe('spellcasting')
  })
})
