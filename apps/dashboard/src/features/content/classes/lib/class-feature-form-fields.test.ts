import { describe, expect, it } from 'vitest'

import {
  createFeatureRowFormSchema,
  featureFromFormRow,
  featuresFromFormValues,
  featureToFormRow,
  subclassFeatureFromFormRow,
  formatFeatureRowSummary,
} from './class-feature-form-fields'
import { GRANT_DEFAULT_UNLOCK_LEVEL } from '../../lib/forms/grants/grant-form-schema'

const rageProgressionTable = {
  id: 'rage-progression',
  name: 'Rage progression',
  kind: 'levelProgression' as const,
  columns: [
    {
      id: 'uses',
      label: 'Rages',
      valueType: 'number' as const,
      entries: [{ level: 1, value: 2 }],
    },
  ],
}

describe('class feature form round-trip', () => {
  it('maps feature tables into the form row and back on save', () => {
    const existing = {
      kind: 'custom' as const,
      id: 'rage',
      name: 'Rage',
      level: 1,
      tables: [rageProgressionTable],
    }
    const row = featureToFormRow(existing)
    expect(row.tables).toEqual(existing.tables)

    const saved = featureFromFormRow({ ...row, id: existing.id })
    expect(saved.kind).toBe('custom')
    if (saved.kind === 'custom') {
      expect(saved.tables).toEqual(existing.tables)
    }
  })

  it('round-trips edited tables through featuresFromFormValues', () => {
    const existing = [
      {
        kind: 'custom' as const,
        id: 'rage',
        name: 'Rage',
        level: 1,
        tables: [rageProgressionTable],
      },
    ]
    const editedTable = {
      ...rageProgressionTable,
      name: 'Updated rage progression',
    }
    const rows = existing.map(featureToFormRow).map((row) => ({
      ...row,
      name: 'Rage Updated',
      description: '<p>Updated</p>',
      tables: [editedTable],
    }))

    const saved = featuresFromFormValues(rows, existing)[0]
    expect(saved?.kind).toBe('custom')
    if (saved?.kind === 'custom') {
      expect(saved.tables).toEqual([editedTable])
    }
  })

  it('omits tables when the form row has none', () => {
    const row = {
      id: 'second-wind',
      name: 'Second Wind',
      level: 1,
      grants: [],
      tables: [],
      available: true,
    }
    expect(featureFromFormRow(row)).not.toHaveProperty('tables')
  })

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

  it('omits available from subclass feature save', () => {
    const row = {
      id: 'improved-critical',
      name: 'Improved Critical',
      level: 3,
      grants: [],
      tables: [],
      available: false,
    }
    expect(subclassFeatureFromFormRow(row)).not.toHaveProperty('available')
  })

  it('persists available false on class feature save and omits when true', () => {
    const row = {
      id: 'second-wind',
      name: 'Second Wind',
      level: 1,
      grants: [],
      tables: [],
      available: false,
    }
    expect(featureFromFormRow(row).available).toBe(false)

    const availableRow = { ...row, available: true }
    expect(featureFromFormRow(availableRow)).not.toHaveProperty('available')
  })

  it('defaults missing kind to custom on save', () => {
    const row = {
      id: 'second-wind',
      name: 'Second Wind',
      level: 1,
      grants: [],
      tables: [],
      available: true,
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

describe('createFeatureRowFormSchema', () => {
  it('rejects grant unlock levels at or below the feature level', () => {
    const schema = createFeatureRowFormSchema()
    const result = schema.safeParse({
      name: 'Domain Spells',
      level: 3,
      grants: [
        {
          grantType: 'languages',
          unlockLevel: 3,
          language: 'common',
        },
      ],
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(
        result.error.issues.some((issue) => issue.path.join('.') === 'grants.0.unlockLevel'),
      ).toBe(true)
    }
  })

  it('accepts default unlock and later unlock levels', () => {
    const schema = createFeatureRowFormSchema()

    expect(
      schema.safeParse({
        name: 'Domain Spells',
        level: 3,
        grants: [
          {
            grantType: 'languages',
            unlockLevel: GRANT_DEFAULT_UNLOCK_LEVEL,
            language: 'common',
          },
        ],
      }).success,
    ).toBe(true)

    expect(
      schema.safeParse({
        name: 'Domain Spells',
        level: 3,
        grants: [
          {
            grantType: 'languages',
            unlockLevel: 5,
            language: 'common',
          },
        ],
      }).success,
    ).toBe(true)
  })
})
