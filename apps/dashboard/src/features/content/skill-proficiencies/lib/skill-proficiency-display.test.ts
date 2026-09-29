import { describe, expect, it } from 'vitest'

import { ATHLETICS } from '../fixtures'
import {
  buildSkillProficiencyDetailViewModel,
  buildSkillProficiencyHeroStatRows,
} from './skill-proficiency-display'

describe('buildSkillProficiencyDetailViewModel', () => {
  it('builds the athletics detail view model', () => {
    expect(buildSkillProficiencyDetailViewModel(ATHLETICS)).toEqual({
      governingAbilityLabel: 'Strength',
      summarySentence:
        'Athletics covers physical challenges involving strength, movement, and force.',
      examples: ['Jump farther than normal', 'Stay afloat in rough water', 'Break something'],
      examplesSectionTitle: 'Examples',
    })
  })
})

describe('buildSkillProficiencyHeroStatRows', () => {
  it('returns governing ability for the shared hero grid', () => {
    expect(buildSkillProficiencyHeroStatRows('Strength')).toEqual([
      { label: 'Governing Ability', value: 'Strength' },
    ])
  })
})
