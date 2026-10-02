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
    expect(classEvidence?.scope).toEqual({ kind: 'class', classId: 'test:bard' })
  })

  it('drops a class-scoped signal for another class and keeps a global role preference', () => {
    const accumulators: AccumulatorMap = new Map()

    addRecommendationContribution(accumulators, 'test:spear', 'strong', 'classSuggested', 'exact', {
      source: { kind: 'class', id: 'test:fighter' },
      selectedClassId: 'test:wizard',
    })
    addRecommendationContribution(accumulators, 'test:spear', 'strong', 'classSuggested', 'exact', {
      source: { kind: 'role', id: 'guard' },
      scope: { kind: 'global' },
      selectedClassId: 'test:wizard',
    })

    expect(accumulators.get('test:spear')?.evidence).toEqual([
      expect.objectContaining({
        source: { kind: 'role', id: 'guard' },
        scope: { kind: 'global' },
      }),
    ])
  })
})
