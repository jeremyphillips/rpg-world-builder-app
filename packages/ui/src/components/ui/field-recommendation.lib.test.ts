import { describe, expect, it, vi } from 'vitest'

import {
  FIELD_RECOMMENDATION_GROUP_BULK_MIN_COUNT,
  resolveActionableFieldRecommendationItems,
  resolveFieldLayoutRecommendation,
  resolveFieldRecommendationButtonScale,
  resolveFieldRecommendationGroupBulkAction,
} from './field-recommendation.lib'
import type { FieldRecommendation, FieldRecommendationGroup } from './field-recommendation.types'

const sample: FieldRecommendation = {
  content: 'Try this.',
  action: { label: '+ Add', ariaLabel: 'Add item', onClick: vi.fn() },
}

describe('resolveFieldRecommendationButtonScale', () => {
  it('uses compact sm text button for every form density', () => {
    expect(resolveFieldRecommendationButtonScale('comfortable')).toEqual({
      size: 'sm',
      density: 'compact',
    })
    expect(resolveFieldRecommendationButtonScale('compact')).toEqual({
      size: 'sm',
      density: 'compact',
    })
  })
})

describe('resolveFieldRecommendationGroupBulkAction', () => {
  const bulkAction = {
    label: 'Add all',
    ariaLabel: 'Add all 3 recommended items',
    onClick: vi.fn(),
  }

  function groupWithItemCount(
    count: number,
    disabledIndices: number[] = [],
  ): FieldRecommendationGroup {
    return {
      items: Array.from({ length: count }, (_, index) => ({
        id: `item-${index}`,
        label: `Item ${index}`,
        disabled: disabledIndices.includes(index),
        action: {
          label: '+ Add',
          ariaLabel: `Add Item ${index}`,
          onClick: vi.fn(),
        },
      })),
      bulkAction,
    }
  }

  it(`requires at least ${FIELD_RECOMMENDATION_GROUP_BULK_MIN_COUNT} actionable items`, () => {
    expect(resolveFieldRecommendationGroupBulkAction(groupWithItemCount(2))).toBeNull()
    expect(resolveFieldRecommendationGroupBulkAction(groupWithItemCount(3))).toBe(bulkAction)
  })

  it('excludes disabled items from the actionable threshold', () => {
    expect(resolveFieldRecommendationGroupBulkAction(groupWithItemCount(4, [0]))).toBe(bulkAction)
    expect(resolveFieldRecommendationGroupBulkAction(groupWithItemCount(4, [0, 1]))).toBeNull()
  })

  it('returns null when bulkAction is omitted', () => {
    expect(
      resolveFieldRecommendationGroupBulkAction({
        items: groupWithItemCount(3).items,
      }),
    ).toBeNull()
  })
})

describe('resolveActionableFieldRecommendationItems', () => {
  it('drops disabled items', () => {
    const items = resolveActionableFieldRecommendationItems([
      { id: 'a', label: 'A', action: { label: '+', ariaLabel: 'Add A', onClick: vi.fn() } },
      {
        id: 'b',
        label: 'B',
        disabled: true,
        action: { label: '+', ariaLabel: 'Add B', onClick: vi.fn() },
      },
    ])
    expect(items).toHaveLength(1)
    expect(items[0]?.id).toBe('a')
  })
})

describe('resolveFieldLayoutRecommendation', () => {
  it('returns the recommendation for below-label hints', () => {
    expect(resolveFieldLayoutRecommendation('below-label', sample)).toBe(sample)
  })

  it('returns the recommendation when hint is below-control', () => {
    expect(resolveFieldLayoutRecommendation('below-control', sample)).toBe(sample)
  })
})
