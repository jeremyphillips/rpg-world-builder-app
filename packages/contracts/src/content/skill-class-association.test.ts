import { describe, expect, it } from 'vitest'

import {
  diffClassSkillEdges,
  skillSlugsSuggestingClass,
  stripClassSkillFromFromInput,
  withDerivedClassSkillFrom,
} from './skill-class-association'
import type { SkillClassAssociationSkill } from './skill-class-association'
import type { ClassStored } from './class/class'

const skills: SkillClassAssociationSkill[] = [
  { slug: 'athletics', suggestedClasses: ['barbarian', 'fighter'] },
  { slug: 'stealth', suggestedClasses: ['rogue', 'ranger'] },
  { slug: 'arcana', suggestedClasses: ['wizard'] },
]

describe('skillSlugsSuggestingClass', () => {
  it('returns skill slugs that list the class', () => {
    expect(skillSlugsSuggestingClass('fighter', skills)).toEqual(['athletics'])
    expect(skillSlugsSuggestingClass('rogue', skills)).toEqual(['stealth'])
  })

  it('returns an empty array when no skills suggest the class', () => {
    expect(skillSlugsSuggestingClass('cleric', skills)).toEqual([])
  })

  it('sorts results alphabetically', () => {
    const many: SkillClassAssociationSkill[] = [
      { slug: 'survival', suggestedClasses: ['ranger'] },
      { slug: 'athletics', suggestedClasses: ['ranger'] },
      { slug: 'nature', suggestedClasses: ['ranger'] },
    ]
    expect(skillSlugsSuggestingClass('ranger', many)).toEqual(['athletics', 'nature', 'survival'])
  })
})

describe('diffClassSkillEdges', () => {
  it('detects added and removed skill slugs', () => {
    expect(diffClassSkillEdges(['athletics', 'stealth'], ['athletics', 'arcana'])).toEqual({
      added: ['arcana'],
      removed: ['stealth'],
    })
  })

  it('returns empty arrays when lists are unchanged', () => {
    expect(diffClassSkillEdges(['athletics'], ['athletics'])).toEqual({
      added: [],
      removed: [],
    })
  })
})

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
    armor: ['light'],
    weapons: { categories: ['simple'] },
    skills: { choose: 2 },
  },
  features: [],
}

describe('withDerivedClassSkillFrom', () => {
  it('attaches sorted skill slugs from the skill-side SSOT', () => {
    const read = withDerivedClassSkillFrom(storedFighter, skills)
    expect(read.proficiencies.skills.from).toEqual(['athletics'])
  })
})

describe('stripClassSkillFromFromInput', () => {
  it('removes skills.from before persistence validation', () => {
    expect(
      stripClassSkillFromFromInput({
        proficiencies: { skills: { choose: 2, from: ['athletics'] } },
      }),
    ).toEqual({ proficiencies: { skills: { choose: 2 } } })
  })
})
