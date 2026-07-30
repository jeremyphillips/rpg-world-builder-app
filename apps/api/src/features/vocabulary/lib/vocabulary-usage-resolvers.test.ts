import { describe, expect, it } from 'vitest'

import {
  vocabularySetIdsRequiringBatchCountResolver,
  vocabularySetIdsRequiringUsageResolver,
} from '@rpg/contracts'

import {
  assertVocabularyBatchCountResolverCoverage,
  assertVocabularyUsageResolverCoverage,
  VOCABULARY_BATCH_COUNT_RESOLVERS,
  VOCABULARY_USAGE_RESOLVERS,
} from './vocabulary-usage-resolvers'

describe('vocabulary usage resolvers', () => {
  it('registers resolvers for every guard/counting-enabled set', () => {
    expect(() => assertVocabularyUsageResolverCoverage()).not.toThrow()
  })

  it('registers batch count resolvers for every batchUsageCounting set', () => {
    expect(() => assertVocabularyBatchCountResolverCoverage()).not.toThrow()
  })

  it('covers creature-types in the production registries', () => {
    for (const setId of vocabularySetIdsRequiringUsageResolver()) {
      expect(VOCABULARY_USAGE_RESOLVERS[setId]).toBeDefined()
    }
    for (const setId of vocabularySetIdsRequiringBatchCountResolver()) {
      expect(VOCABULARY_BATCH_COUNT_RESOLVERS[setId]).toBeDefined()
    }
  })
})
