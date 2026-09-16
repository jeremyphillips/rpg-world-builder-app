import { describe, expect, it } from 'vitest'

import { choiceCountPhrase, nounFromLabel, resolveChoicePlaceholder } from './messages'

describe('field copy helpers', () => {
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
