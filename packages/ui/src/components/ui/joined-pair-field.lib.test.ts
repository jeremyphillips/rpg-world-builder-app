import { describe, expect, it } from 'vitest'

import {
  assertAllowedJoinedPairComposition,
  customJoinedPairSelection,
  isJoinedPairCustomAmountInBounds,
  joinedPairBoundNames,
  lowestNumericPreset,
} from './joined-pair-field.lib'

describe('joined-pair-field.lib', () => {
  it('allows select + label composition', () => {
    expect(() =>
      assertAllowedJoinedPairComposition({
        start: {
          kind: 'select',
          name: 'feet',
          options: [{ value: 30, label: '30' }],
          ariaLabel: 'Speed value',
        },
        end: {
          kind: 'label',
          text: 'ft.',
          ariaLabel: 'Speed unit',
        },
      }),
    ).not.toThrow()
  })

  it('rejects number + label composition in inline sentence joined pairs', () => {
    expect(() =>
      assertAllowedJoinedPairComposition({
        start: {
          kind: 'number',
          name: 'feet',
          ariaLabel: 'Speed value',
        },
        end: {
          kind: 'label',
          text: 'ft.',
          ariaLabel: 'Speed unit',
        },
      }),
    ).toThrow(/unsupported occupant composition/)
  })

  it('collects bound names from named occupants only', () => {
    expect(
      joinedPairBoundNames({
        start: {
          kind: 'select',
          name: 'feet',
          options: [{ value: 30, label: '30' }],
          ariaLabel: 'Speed value',
        },
        end: {
          kind: 'label',
          text: 'ft.',
          ariaLabel: 'Speed unit',
        },
      }),
    ).toEqual(['feet'])
  })

  it('uses the lowest preset as the custom starting point and rejects negatives', () => {
    const presets = [
      { value: 5, label: '5' },
      { value: 10, label: '10' },
      { value: 600, label: '600' },
    ]
    expect(lowestNumericPreset(presets)).toBe(5)
    expect(isJoinedPairCustomAmountInBounds(-1, 1)).toBe(false)
    expect(isJoinedPairCustomAmountInBounds(7, 1, 600)).toBe(true)
    expect(isJoinedPairCustomAmountInBounds(601, 1, 600)).toBe(false)
    expect(customJoinedPairSelection({ value: 600, options: presets, customMin: 1 })).toEqual({
      write: 5,
    })
    expect(customJoinedPairSelection({ value: 5, options: presets, customMin: 1 })).toEqual({
      keep: true,
    })
    expect(
      customJoinedPairSelection({ value: 7, options: presets, customMin: 1, customMax: 600 }),
    ).toEqual({ keep: true })
    expect(customJoinedPairSelection({ value: -1, options: presets, customMin: 1 })).toEqual({
      write: 5,
    })
  })
})
