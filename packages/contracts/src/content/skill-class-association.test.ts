import { describe, expect, it } from 'vitest'

import { diffClassSkillEdges, skillSlugsSuggestingClass } from './skill-class-association'
import type { SkillClassAssociationSkill } from './skill-class-association'

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
