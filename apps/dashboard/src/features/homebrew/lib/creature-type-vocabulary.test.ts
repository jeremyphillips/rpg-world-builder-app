import { describe, expect, it } from 'vitest'

import { buildSeedCreatureTypeVocabulary } from './creature-type-vocabulary'

describe('creature-type-vocabulary', () => {
  it('marks every seed creature type as active', () => {
    const vocabulary = buildSeedCreatureTypeVocabulary()
    expect(vocabulary.activeIds.has('humanoid')).toBe(true)
    expect(vocabulary.labelById.humanoid).toBe('Humanoid')
  })
})
