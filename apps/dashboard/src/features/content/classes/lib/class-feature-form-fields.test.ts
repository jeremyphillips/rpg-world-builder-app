import { describe, expect, it } from 'vitest'

import { formatFeatureRowSummary } from './class-feature-form-fields'

describe('formatFeatureRowSummary', () => {
  it('joins level and grant count with the array item separator', () => {
    expect(
      formatFeatureRowSummary({
        name: 'Rage',
        level: 1,
        grants: [{ grantType: 'movement' }],
      }),
    ).toBe('Level 1 · 1 grant')
  })

  it('pluralizes grant count and omits the feature name', () => {
    expect(
      formatFeatureRowSummary({
        name: 'Extra Attack',
        level: 3,
        grants: [{ grantType: 'movement' }, { grantType: 'proficiencies' }],
      }),
    ).toBe('Level 3 · 2 grants')
  })

  it('returns only the level when grants are absent', () => {
    expect(
      formatFeatureRowSummary({
        name: 'Extra Attack',
        level: 5,
        grants: [],
      }),
    ).toBe('Level 5')
  })
})
