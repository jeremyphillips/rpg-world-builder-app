import { describe, expect, it } from 'vitest'

import {
  addRecommendationContribution,
  toEquipmentRecommendation,
  type AccumulatorMap,
} from './equipment-recommendation-accumulator'

describe('equipment recommendation accumulator', () => {
  it('collapses the most specific selective evidence onto the recommendation', () => {
    const accumulators: AccumulatorMap = new Map()

    addRecommendationContribution(
      accumulators,
      'test:lute',
      'strong',
      'unresolvedToolProficiencyChoice',
      'broad_pool',
    )
    addRecommendationContribution(
      accumulators,
      'test:lute',
      'strong',
      'availableInStartingOption',
      'exact',
      { source: { kind: 'class', id: 'test:bard' } },
    )
    const recommendation = toEquipmentRecommendation(accumulators.get('test:lute')!)
    expect(recommendation).toMatchObject({
      tier: 'strong',
      specificity: 'exact',
      reasons: expect.arrayContaining([
        'unresolvedToolProficiencyChoice',
        'availableInStartingOption',
      ]),
    })
    const classEvidence = recommendation.evidence.find(
      (entry) => entry.reason === 'availableInStartingOption',
    )
    expect(classEvidence?.source).toEqual({ kind: 'class', id: 'test:bard' })
  })
})
