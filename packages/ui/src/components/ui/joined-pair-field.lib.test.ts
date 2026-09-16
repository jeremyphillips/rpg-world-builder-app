import { describe, expect, it } from 'vitest'

import { assertAllowedJoinedPairComposition, joinedPairBoundNames } from './joined-pair-field.lib'

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
})
