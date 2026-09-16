import { describe, expect, it } from 'vitest'

import { customClassFeatureSchema, classStoredSchema } from './class'
import {
  featureTableSchema,
  normalizeFeatureTableColumnEntries,
  numberFeatureTableColumnSchema,
} from './feature-table'
import {
  collectFeatureTableBreakpoints,
  projectFeatureTableRows,
  resolveFeatureTableColumnValue,
} from './feature-table-resolution'

const rageProgressionTable = {
  id: 'rage-progression',
  name: 'Rage progression',
  kind: 'levelProgression' as const,
  columns: [
    {
      id: 'uses',
      label: 'Rages',
      valueType: 'number' as const,
      entries: [
        { level: 1, value: 2 },
        { level: 3, value: 3 },
        { level: 6, value: 4 },
        { level: 12, value: 5 },
        { level: 17, value: 6 },
      ],
    },
    {
      id: 'damage-bonus',
      label: 'Rage Damage',
      valueType: 'number' as const,
      entries: [
        { level: 1, value: 2 },
        { level: 9, value: 3 },
        { level: 16, value: 4 },
      ],
    },
  ],
}

describe('featureTableSchema', () => {
  it('parses a valid multi-column level progression table', () => {
    expect(featureTableSchema.parse(rageProgressionTable)).toEqual(rageProgressionTable)
  })

  it('parses a valid single-column text progression table', () => {
    expect(
      featureTableSchema.parse({
        id: 'notes-progression',
        name: 'Notes progression',
        kind: 'levelProgression',
        columns: [
          {
            id: 'note',
            label: 'Note',
            valueType: 'text',
            entries: [{ level: 1, value: 'A' }],
          },
        ],
      }),
    ).toMatchObject({ columns: [{ valueType: 'text' }] })
  })

  it('rejects duplicate column ids within a table', () => {
    expect(
      featureTableSchema.safeParse({
        ...rageProgressionTable,
        columns: [rageProgressionTable.columns[0], { ...rageProgressionTable.columns[0] }],
      }).success,
    ).toBe(false)
  })

  it('rejects duplicate entry levels within a column', () => {
    expect(
      numberFeatureTableColumnSchema.safeParse({
        id: 'uses',
        label: 'Rages',
        valueType: 'number',
        entries: [
          { level: 1, value: 2 },
          { level: 1, value: 3 },
        ],
      }).success,
    ).toBe(false)
  })

  it('rejects out-of-order entry levels', () => {
    expect(
      numberFeatureTableColumnSchema.safeParse({
        id: 'uses',
        label: 'Rages',
        valueType: 'number',
        entries: [
          { level: 6, value: 4 },
          { level: 3, value: 3 },
        ],
      }).success,
    ).toBe(false)
  })

  it('rejects invalid entry levels above 20', () => {
    expect(
      numberFeatureTableColumnSchema.safeParse({
        id: 'uses',
        label: 'Rages',
        valueType: 'number',
        entries: [{ level: 21, value: 2 }],
      }).success,
    ).toBe(false)
  })

  it('rejects empty columns and tables', () => {
    expect(
      featureTableSchema.safeParse({
        id: 'empty',
        name: 'Empty',
        kind: 'levelProgression',
        columns: [],
      }).success,
    ).toBe(false)
  })
})

describe('customClassFeatureSchema feature tables', () => {
  it('rejects duplicate table ids on a feature', () => {
    expect(
      customClassFeatureSchema.safeParse({
        kind: 'custom',
        id: 'rage',
        name: 'Rage',
        level: 1,
        tables: [rageProgressionTable, rageProgressionTable],
      }).success,
    ).toBe(false)
  })

  it('rejects progression entries before the owning feature level', () => {
    expect(
      customClassFeatureSchema.safeParse({
        kind: 'custom',
        id: 'wild-shape',
        name: 'Wild Shape',
        level: 2,
        tables: [
          {
            id: 'wild-shape-progression',
            name: 'Wild Shape progression',
            kind: 'levelProgression',
            columns: [
              {
                id: 'uses',
                label: 'Wild Shape',
                valueType: 'number',
                entries: [{ level: 1, value: 2 }],
              },
            ],
          },
        ],
      }).success,
    ).toBe(false)
  })

  it('accepts feature-owned tables on a stored class body', () => {
    expect(
      classStoredSchema.safeParse({
        id: 'test:barbarian',
        slug: 'barbarian',
        rulesetId: 'srd-cc-5.2.1',
        source: 'system',
        status: 'published',
        campaignId: null,
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
        name: 'Barbarian',
        description: '<p>Test</p>',
        primaryAbilities: ['str'],
        hitDie: 12,
        proficiencies: {
          savingThrows: ['str', 'con'],
          armor: { categories: ['light'], items: [] },
          weapons: { categories: ['simple'], items: [] },
          skills: { categories: [], items: [] },
        },
        features: [
          {
            kind: 'custom',
            id: 'rage',
            name: 'Rage',
            level: 1,
            tables: [rageProgressionTable],
          },
        ],
      }).success,
    ).toBe(true)
  })
})

describe('normalizeFeatureTableColumnEntries', () => {
  it('sorts entries ascending without mutating parse behavior', () => {
    const column = normalizeFeatureTableColumnEntries({
      id: 'uses',
      label: 'Rages',
      valueType: 'number',
      entries: [
        { level: 6, value: 4 },
        { level: 1, value: 2 },
        { level: 3, value: 3 },
      ],
    })

    expect(column.entries.map((entry) => entry.level)).toEqual([1, 3, 6])
    expect(numberFeatureTableColumnSchema.parse(column)).toEqual(column)
  })
})

describe('feature table resolution', () => {
  const usesColumn = rageProgressionTable.columns[0]!
  const damageColumn = rageProgressionTable.columns[1]!

  it('carry-forwards between breakpoints', () => {
    expect(resolveFeatureTableColumnValue(usesColumn, 2)).toBe(2)
    expect(resolveFeatureTableColumnValue(usesColumn, 5)).toBe(3)
  })

  it('returns undefined before the first entry', () => {
    const lateColumn = {
      id: 'late',
      label: 'Late',
      valueType: 'number' as const,
      entries: [{ level: 5, value: 1 }],
    }
    expect(resolveFeatureTableColumnValue(lateColumn, 4)).toBeUndefined()
  })

  it('returns the exact value at a breakpoint', () => {
    expect(resolveFeatureTableColumnValue(usesColumn, 3)).toBe(3)
  })

  it('holds the final breakpoint after the last entry', () => {
    expect(resolveFeatureTableColumnValue(usesColumn, 20)).toBe(6)
  })

  it('projects multi-column rows with independent carry-forward', () => {
    const rows = projectFeatureTableRows(rageProgressionTable)
    expect(collectFeatureTableBreakpoints(rageProgressionTable)).toEqual([1, 3, 6, 9, 12, 16, 17])

    expect(rows.find((row) => row.level === 1)?.values).toEqual({
      uses: 2,
      'damage-bonus': 2,
    })
    expect(rows.find((row) => row.level === 6)?.values).toEqual({
      uses: 4,
      'damage-bonus': 2,
    })
    expect(rows.find((row) => row.level === 9)?.values).toEqual({
      uses: 4,
      'damage-bonus': 3,
    })
  })

  it('narrows numeric column values in resolution', () => {
    if (usesColumn.valueType === 'number') {
      expect(resolveFeatureTableColumnValue(usesColumn, 1)).toBe(2)
    }
    if (damageColumn.valueType === 'number') {
      expect(resolveFeatureTableColumnValue(damageColumn, 9)).toBe(3)
    }
  })
})
