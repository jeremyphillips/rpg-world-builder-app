import { describe, expect, it } from 'vitest'

import { vocabularySetIdsRequiringUsageResolver } from '@rpg/contracts'

import {
  assertVocabularyUsageResolverCoverage,
  VOCABULARY_USAGE_RESOLVERS,
} from './vocabulary-usage-resolvers'

describe('vocabulary usage resolvers', () => {
  it('registers resolvers for every guard/counting-enabled set', () => {
    expect(() => assertVocabularyUsageResolverCoverage()).not.toThrow()
  })

  it('covers creature-types in the production registry', () => {
    for (const setId of vocabularySetIdsRequiringUsageResolver()) {
      expect(VOCABULARY_USAGE_RESOLVERS[setId]).toBeDefined()
    }
  })
})
