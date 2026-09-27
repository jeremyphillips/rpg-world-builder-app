import { describe, expect, it } from 'vitest'
import type { ColumnDef } from '@rpg/ui'

import { buildContentColumns, costColumn } from './content-table-config'

type PricedRow = { cost: { amount: number; currency: 'gp' | 'cp' } }

describe('costColumn', () => {
  it('sorts by copper-piece value and exposes cost metadata', () => {
    const column = costColumn<PricedRow>() as ColumnDef<PricedRow, number> & {
      accessorFn: (row: PricedRow) => number
    }
    const row = { cost: { amount: 15, currency: 'gp' as const } }

    expect(column.id).toBe('cost')
    expect(column.accessorFn(row)).toBe(1500)
    expect(column.meta).toEqual({ label: 'Cost' })
  })
})

function columnIds<T>(columns: ColumnDef<T>[]): string[] {
  return columns.map(
    (column) =>
      column.id ??
      (typeof (column as { accessorKey?: unknown }).accessorKey === 'string'
        ? (column as { accessorKey: string }).accessorKey
        : ''),
  )
}

describe('buildContentColumns', () => {
  it('includes source chrome according to the content-type presentation policy', () => {
    const columns = buildContentColumns([], { contentType: 'classes' })

    expect(columnIds(columns)).toContain('source')
  })

  it('places the display image column before name for classes and species', () => {
    const classIds = columnIds(buildContentColumns([], { contentType: 'classes' }))
    const speciesIds = columnIds(buildContentColumns([], { contentType: 'species' }))

    expect(classIds[0]).toBe('overview-display-image')
    expect(classIds[1]).toBe('name')
    expect(speciesIds[0]).toBe('overview-display-image')
    expect(speciesIds[1]).toBe('name')
  })
})
