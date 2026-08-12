import { describe, expect, it } from 'vitest'

import { projectArrayItemEntitySummary } from './array-item-entity-summary.lib'

describe('projectArrayItemEntitySummary', () => {
  it('uses primary as heading and summary as description', () => {
    expect(
      projectArrayItemEntitySummary({
        header: {
          primary: 'Speak with Animals',
          fallback: 'Grant 1',
          ariaLabel: 'Grants · Speak with Animals',
          showDivider: false,
          showFallbackInTitle: false,
          srOnly: false,
        },
        summary: 'Character has Speak with Animals always prepared.',
        classification: 'Spells',
      }),
    ).toEqual({
      heading: 'Speak with Animals',
      classification: 'Spells',
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
})
