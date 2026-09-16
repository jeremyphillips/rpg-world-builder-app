import { describe, expect, it } from 'vitest'

import {
  choiceCountPhrase,
  midSentenceLabel,
  nounFromLabel,
  resolveChoicePlaceholder,
  singularizeLabel,
  withArticle,
} from './messages'

describe('form copy helpers', () => {
  it('lowercases labels mid-sentence but preserves initialisms', () => {
    expect(midSentenceLabel('Damage type')).toBe('damage type')
    expect(midSentenceLabel('XP progression')).toBe('XP progression')
  })

  it('picks the indefinite article by leading vowel', () => {
    expect(withArticle('rarity')).toBe('a rarity')
    expect(withArticle('ability')).toBe('an ability')
  })

  it('singularizes common plural labels', () => {
    expect(singularizeLabel('Wealth tiers')).toBe('Wealth tier')
    expect(singularizeLabel('Abilities')).toBe('Ability')
    expect(singularizeLabel('Class')).toBe('Class')
  })

  const primaryAbilities = {
    singular: 'primary ability',
    plural: 'primary abilities',
  }

  it('derives noun metadata from labels', () => {
    expect(nounFromLabel('Primary abilities')).toEqual({
      singular: 'primary ability',
      plural: 'primary abilities',
    })
  })

  it('formats choice placeholders for single and multi fields', () => {
    expect(resolveChoicePlaceholder({ singular: 'rarity' }, false)).toBe('Choose a rarity…')
    expect(resolveChoicePlaceholder(primaryAbilities, true)).toBe('Choose primary abilities…')
  })

  it.each([
    [primaryAbilities, { min: 1 }, 'Choose at least one primary ability.'],
    [primaryAbilities, { min: 2 }, 'Choose at least 2 primary abilities.'],
    [primaryAbilities, { max: 2 }, 'Choose up to 2 primary abilities.'],
    [primaryAbilities, { min: 2, max: 2 }, 'Choose 2 primary abilities.'],
    [primaryAbilities, { min: 1, max: 2 }, 'Choose 1–2 primary abilities.'],
    [
      { singular: 'piece of armor', plural: 'pieces of armor' },
      { min: 1 },
      'Choose at least one piece of armor.',
    ],
  ])('formats choice count copy %#', (noun, constraints, expected) => {
    expect(choiceCountPhrase(noun, constraints)).toBe(expected)
  })
})
