import { describe, expect, it } from 'vitest'

import { projectArrayItemEntitySummary } from './array-item-entity-summary.lib'

describe('projectArrayItemEntitySummary', () => {
  it('uses primary as heading and summary as description', () => {
    expect(
      projectArrayItemEntitySummary({
        header: {
          primary: 'Spells',
          fallback: 'Grant 1',
          ariaLabel: 'Grants · Spells',
          showDivider: false,
          showFallbackInTitle: false,
          srOnly: false,
        },
        summary: 'Character has Speak with Animals always prepared.',
        classification: 'Speak with Animals',
      }),
    ).toEqual({
      heading: 'Spells',
      classification: 'Speak with Animals',
      description: 'Character has Speak with Animals always prepared.',
    })
  })

  it('falls back to the array header fallback when primary is empty', () => {
    expect(
      projectArrayItemEntitySummary({
        header: {
          fallback: 'Grant 2',
          ariaLabel: 'Grants · Grant 2',
          showDivider: false,
          showFallbackInTitle: false,
          srOnly: false,
        },
      }),
    ).toEqual({ heading: 'Grant 2' })
  })

  it('omits classification when it matches the heading', () => {
    expect(
      projectArrayItemEntitySummary({
        header: {
          primary: 'Movement',
          fallback: 'Grant 1',
          ariaLabel: 'Grants · Movement',
          showDivider: false,
          showFallbackInTitle: false,
          srOnly: false,
        },
        classification: 'Movement',
      }),
    ).toEqual({ heading: 'Movement' })
  })

  it('omits composed classification remnants that repeat the heading', () => {
    expect(
      projectArrayItemEntitySummary({
        header: {
          primary: 'Armor training',
          fallback: 'Grant 1',
          ariaLabel: 'Grants · Armor training',
          showDivider: false,
          showFallbackInTitle: false,
          srOnly: false,
        },
        classification: 'Armor training — Medium armor',
      }),
    ).toEqual({ heading: 'Armor training' })
  })
})
