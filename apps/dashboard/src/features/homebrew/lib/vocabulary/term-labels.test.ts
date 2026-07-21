import { CREATURE_TYPE_TERM, DAMAGE_TYPE_TERM } from '@rpg/contracts'
import { describe, expect, it } from 'vitest'

import { vocabularyFieldLabel, vocabularyHubLabel } from './term-labels'

describe('vocabulary term labels', () => {
  it('builds hub labels from plural sentence forms', () => {
    expect(vocabularyHubLabel(CREATURE_TYPE_TERM)).toBe('Creature Types')
    expect(vocabularyHubLabel(DAMAGE_TYPE_TERM)).toBe('Damage Types')
  })

  it('builds field labels from singular and plural sentence forms', () => {
    expect(vocabularyFieldLabel(CREATURE_TYPE_TERM)).toBe('Creature type')
    expect(vocabularyFieldLabel(CREATURE_TYPE_TERM, { plural: true })).toBe('Creature types')
  })
})
