import { describe, expect, it } from 'vitest'

import { withDerivedClassSkillFrom } from '../../../content/skill-class-association'
import type { ClassStored } from '../../../content/classes/class'
import type { SkillProficiency } from '../../../content/skill-proficiency'
import {
  deriveCharacterProfile,
  findSkillProficiencyRank,
  type CharacterDerivationInput,
} from './profile'

const storedFighter: ClassStored = {
  id: 'srd-cc-5.2.1:fighter',
  slug: 'fighter',
  rulesetId: 'srd-cc-5.2.1',
  source: 'system',
  campaignId: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  name: 'Fighter',
  primaryAbilities: ['str'],
  hitDie: 10,
  proficiencies: {
    savingThrows: ['str', 'con'],
    armor: ['light', 'medium'],
    weapons: { categories: ['simple', 'martial'] },
    skills: { choose: 2 },
  },
  features: [],
}

const fighterClass = withDerivedClassSkillFrom(storedFighter, [
  { slug: 'athletics', suggestedClasses: ['fighter'] },
])

const athleticsSkill = {
  id: 'srd-cc-5.2.1:athletics',
  slug: 'athletics',
  rulesetId: 'srd-cc-5.2.1',
  source: 'system',
  campaignId: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  name: 'Athletics',
  ability: 'str',
  suggestedClasses: ['fighter'],
} as const satisfies SkillProficiency

const completeInput: CharacterDerivationInput = {
  level: 1,
  abilityScores: { str: 15, dex: 14, con: 13, int: 12, wis: 10, cha: 8 },
  characterClass: fighterClass,
  proficiencies: {
    skills: [{ skill: 'athletics', rank: 'proficient' }],
    weapons: [],
    armor: [],
    tools: [],
  },
  skillProficiencies: [athleticsSkill],
}

describe('deriveCharacterProfile', () => {
  it('tolerates empty input without throwing', () => {
    expect(() =>
      deriveCharacterProfile({
        level: 1,
        proficiencies: { skills: [], weapons: [], armor: [], tools: [] },
        skillProficiencies: [],
      }),
    ).not.toThrow()
  })

  it('derives partial stats when class is missing', () => {
    const profile = deriveCharacterProfile({
      level: 1,
      abilityScores: { dex: 14 },
      proficiencies: { skills: [], weapons: [], armor: [], tools: [] },
      skillProficiencies: [athleticsSkill],
    })

    expect(profile.proficiencyBonus).toBeUndefined()
    expect(profile.maxHp).toBeUndefined()
    expect(profile.ac).toBe(12)
  })

  it('derives level-1 fighter stats from complete input', () => {
    const profile = deriveCharacterProfile(completeInput)

    expect(profile.proficiencyBonus).toBe(2)
    expect(profile.maxHp).toBe(11)
    expect(profile.ac).toBe(12)
    expect(profile.abilityScores.str).toEqual({ score: 15, modifier: 2 })
    expect(profile.savingThrows.find((save) => save.ability === 'str')).toMatchObject({
      proficient: true,
      bonus: 4,
    })
    expect(profile.skills.find((skill) => skill.skillId === 'athletics')).toMatchObject({
      modifier: 4,
      rank: 'proficient',
    })
    expect(profile.spellcasting).toBeNull()
  })
})

describe('findSkillProficiencyRank', () => {
  it('returns the rank for a known skill id', () => {
    expect(findSkillProficiencyRank(completeInput.proficiencies, 'athletics')).toBe('proficient')
  })

  it('returns undefined when the skill is not proficient', () => {
    expect(findSkillProficiencyRank(completeInput.proficiencies, 'stealth')).toBeUndefined()
  })
})
