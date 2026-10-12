import { describe, expect, it } from 'vitest'

import { monsterSkillDerivedMetadataLine } from './monster-skill-derived-metadata.lib'

describe('monsterSkillDerivedMetadataLine', () => {
  it('joins ability modifier and proficiency bonus for proficient ranks', () => {
    expect(
      monsterSkillDerivedMetadataLine({
        ability: 'dex',
        abilityScore: 16,
        rank: 'proficient',
        proficiencyBonus: 2,
      }),
    ).toBe('DEX +3 · PB +2')
  })

  it('doubles pb contribution for expertise', () => {
    expect(
      monsterSkillDerivedMetadataLine({
        ability: 'dex',
        abilityScore: 16,
        rank: 'expertise',
        proficiencyBonus: 2,
      }),
    ).toBe('DEX +3 · PB +4')
  })
})
