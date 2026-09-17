import { describe, expect, it } from 'vitest'

import { generalTableSchema } from './general-table'
import { reincarnateSpeciesTableFixture } from './general-table-fixtures'

describe('generalTableSchema', () => {
  it('parses the Reincarnate 10-row fixture', () => {
    const parsed = generalTableSchema.parse(reincarnateSpeciesTableFixture)
    expect(parsed.rows).toHaveLength(10)
    expect(parsed.rows.map((row) => row.cells.roll)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
  })

  it('allows absent cell keys as blank cells', () => {
    expect(
      generalTableSchema.parse({
        ...reincarnateSpeciesTableFixture,
        rows: [{ id: 'row-1', cells: { roll: 1 } }],
      }),
    ).toMatchObject({ rows: [{ cells: { roll: 1 } }] })
  })

  it('rejects unknown cell column ids', () => {
    expect(() =>
      generalTableSchema.parse({
        ...reincarnateSpeciesTableFixture,
        rows: [{ id: 'row-1', cells: { unknown: 'x' } }],
      }),
    ).toThrow(/Unknown column id/)
  })

  it('rejects invalid cell values for the column type', () => {
    expect(() =>
      generalTableSchema.parse({
        ...reincarnateSpeciesTableFixture,
        rows: [{ id: 'row-1', cells: { roll: 'not-a-number', species: 'Elf' } }],
      }),
    ).toThrow(/does not match its type/)
  })

  it('rejects duplicate table column ids', () => {
    expect(() =>
      generalTableSchema.parse({
        ...reincarnateSpeciesTableFixture,
        columns: [
          { id: 'roll', label: 'A', valueType: 'number' },
          { id: 'roll', label: 'B', valueType: 'text' },
        ],
      }),
    ).toThrow(/Duplicate general table column id/)
  })
})
