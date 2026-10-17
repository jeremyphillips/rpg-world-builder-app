import { describe, expect, it } from 'vitest'

import { levelZeroNpcsDefaultFormValues } from './level-zero-npc-form-values'
import { formatLevelZeroWeaponProficienciesReview } from './level-zero-weapon-proficiencies-review.lib'

describe('formatLevelZeroWeaponProficienciesReview', () => {
  it('summarizes projected none mode', () => {
    const values = levelZeroNpcsDefaultFormValues()
    expect(formatLevelZeroWeaponProficienciesReview(values)).toBe('None')
  })

  it('summarizes projected category grants', () => {
    const values = levelZeroNpcsDefaultFormValues()
    values.levelZeroWeaponGrantMode = 'categories'
    values.levelZeroWeaponProficiencies = { categories: ['martial'], items: [] }
    expect(formatLevelZeroWeaponProficienciesReview(values)).toBe('Martial Weapon')
  })
})
