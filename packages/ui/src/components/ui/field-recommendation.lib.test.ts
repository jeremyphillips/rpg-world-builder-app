import { describe, expect, it, vi } from 'vitest'

import {
  resolveFieldLayoutRecommendation,
  resolveFieldRecommendationButtonScale,
} from './field-recommendation.lib'
import type { FieldRecommendation } from './field-recommendation.types'

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

describe('resolveFieldLayoutRecommendation', () => {
  it('returns the recommendation for below-label hints', () => {
    expect(resolveFieldLayoutRecommendation('below-label', sample)).toBe(sample)
  })

  it('omits the recommendation when hint is below-control', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    expect(resolveFieldLayoutRecommendation('below-control', sample)).toBeNull()
    expect(warn).toHaveBeenCalled()
    warn.mockRestore()
  })
})
