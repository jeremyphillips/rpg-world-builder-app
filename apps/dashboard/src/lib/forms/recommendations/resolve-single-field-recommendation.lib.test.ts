import { describe, expect, it } from 'vitest'

import { resolveSingleFieldRecommendation } from './resolve-single-field-recommendation.lib'

describe('resolveSingleFieldRecommendation', () => {
  it('returns the id when exactly one recommendation is available and none selected', () => {
    expect(
      resolveSingleFieldRecommendation({
        recommendedIds: ['draconic'],
        selectedIds: [],
        availableIds: ['draconic', 'common'],
      }),
    ).toBe('draconic')
  })

  it('returns undefined when multiple recommendations are configured', () => {
    expect(
      resolveSingleFieldRecommendation({
        recommendedIds: ['draconic', 'infernal'],
        selectedIds: [],
        availableIds: ['draconic', 'infernal'],
      }),
    ).toBeUndefined()
  })

  it('returns undefined when any language is selected', () => {
    expect(
      resolveSingleFieldRecommendation({
        recommendedIds: ['draconic'],
        selectedIds: ['common'],
        availableIds: ['draconic'],
      }),
    ).toBeUndefined()
  })

  it('returns undefined when the recommendation is not in available ids', () => {
    expect(
      resolveSingleFieldRecommendation({
        recommendedIds: ['draconic'],
        selectedIds: [],
        availableIds: ['common'],
      }),
    ).toBeUndefined()
  })
})
