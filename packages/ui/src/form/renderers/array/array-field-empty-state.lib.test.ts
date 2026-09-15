import { describe, expect, it } from 'vitest'

import {
  arrayEmptyStateMinRequiredMessage,
  arrayEmptyStatePrimaryMessage,
  resolveArrayEmptyItemLabel,
} from './array-field-empty-state.lib'

describe('array-field-empty-state.lib', () => {
  it('derives mid-sentence item labels from array legend and header fallback', () => {
    expect(
      resolveArrayEmptyItemLabel({
        kind: 'array',
        name: 'movement',
        legend: 'Movement',
        fields: [],
        item: {
          header: {
            fallback: (index) => `Movement ${index + 1}`,
          },
        },
      }),
    ).toBe('movement')
  })

  it('formats empty-state copy', () => {
    expect(arrayEmptyStatePrimaryMessage('movement')).toBe('No movement added.')
    expect(arrayEmptyStateMinRequiredMessage('movement')).toBe('At least one movement is required.')
  })
})
