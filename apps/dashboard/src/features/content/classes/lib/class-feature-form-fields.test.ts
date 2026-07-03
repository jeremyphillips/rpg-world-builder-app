import { describe, expect, it } from 'vitest'

import {
  featureFromFormRow,
  featureToFormRow,
  formatFeatureRowSummary,
} from './class-feature-form-fields'

describe('class feature form round-trip', () => {
  it('preserves subclass-choice kind through form conversion', () => {
    const feature = {
      kind: 'subclass-choice' as const,
      id: 'fighter-subclass',
      name: 'Fighter Subclass',
      level: 3,
    }
    const row = featureToFormRow(feature)
    expect(row.kind).toBe('subclass-choice')
    expect(featureFromFormRow({ ...row, id: feature.id }).kind).toBe('subclass-choice')
  })

  it('defaults missing kind to custom on save', () => {
    const row = {
      id: 'second-wind',
      name: 'Second Wind',
      level: 1,
      grants: [],
    }
    expect(featureFromFormRow(row).kind).toBe('custom')
  })
})

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
        grants: [{ grantType: 'movement' }, { grantType: 'skillProficiency' }],
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
