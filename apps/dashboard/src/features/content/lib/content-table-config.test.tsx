import { describe, expect, it } from 'vitest'
import type { ColumnDef } from '@rpg/ui'

import { costColumn } from './content-table-config'

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
