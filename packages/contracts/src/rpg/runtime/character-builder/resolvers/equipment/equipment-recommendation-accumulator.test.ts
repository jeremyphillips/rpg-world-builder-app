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
      'pool',
      'broad_pool',
    )
    addRecommendationContribution(
      accumulators,
      'test:lute',
      'strong',
      'availableInStartingOption',
      'grant',
      'exact',
    )
    addRecommendationContribution(
      accumulators,
      'test:lute',
      'strong',
      'notProficient',
      'proficiency',
      'exact',
    )

    expect(toEquipmentRecommendation(accumulators.get('test:lute')!)).toMatchObject({
      tier: 'strong',
      specificity: 'exact',
      reasons: expect.arrayContaining([
        'unresolvedToolProficiencyChoice',
        'availableInStartingOption',
        'notProficient',
      ]),
    })
  })
})
