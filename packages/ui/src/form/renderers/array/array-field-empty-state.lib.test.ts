import { describe, expect, it } from 'vitest'

import {
  arrayEmptyStatePrimaryMessage,
  resolveArrayEmptyItemLabel,
  resolveArrayRequiredMarker,
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
  })

  it('derives required marker from min', () => {
    expect(
      resolveArrayRequiredMarker({
        kind: 'array',
        name: 'movement',
        legend: 'Movement',
        fields: [],
        min: 1,
      }),
    ).toBe(true)
    expect(
      resolveArrayRequiredMarker({
        kind: 'array',
        name: 'movement',
        legend: 'Movement',
        fields: [],
      }),
    ).toBe(false)
  })
})
