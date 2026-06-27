import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import type { ColumnDef } from '@rpg/ui'

import { dataTableColumnMeta, dataTableWidthMeta, NameCell, TableBadgeCell } from '@rpg/ui'

import {
  buildNameColumn,
  buildSourceColumn,
  stampDataColumns,
  withColumnWidth,
} from './column-builders'

type Row = { id: string; name: string; source: 'system' | 'homebrew' }

const SOURCE_BADGE = {
  system: { variant: 'secondary' as const, label: 'System' },
  homebrew: { variant: 'outline' as const, label: 'Homebrew' },
}

describe('stampDataColumns', () => {
  it('merges data column tone into each column meta', () => {
    const columns: ColumnDef<Row>[] = [{ accessorKey: 'name', header: 'Name' }]
    const [stamped] = stampDataColumns(columns)
    expect(stamped?.meta).toMatchObject(dataTableColumnMeta.data)
  })

  it('preserves column-specific meta overrides', () => {
    const columns: ColumnDef<Row>[] = [
      { accessorKey: 'name', header: 'Name', meta: { label: 'Custom', columnTone: 'identity' } },
    ]
    const [stamped] = stampDataColumns(columns)
    expect(stamped?.meta).toMatchObject({ label: 'Custom', columnTone: 'identity' })
  })
})

describe('buildNameColumn', () => {
  it('uses identity tone and NameCell', () => {
    const col = buildNameColumn<Row>({ accessorKey: 'name', locked: true })
    expect(col.meta).toMatchObject({ ...dataTableColumnMeta.identity, label: 'Name', locked: true })

    render(<NameCell>Barbarian</NameCell>)
    expect(screen.getByText('Barbarian')).toHaveClass('font-data-name')
  })
})

describe('buildSourceColumn', () => {
  it('uses source tone, compact width, and TableBadgeCell', () => {
    const col = buildSourceColumn<Row, 'system' | 'homebrew'>({ badgeMap: SOURCE_BADGE })
    expect(col.meta).toMatchObject({
      ...dataTableColumnMeta.source,
      ...dataTableWidthMeta('compact'),
    })

    render(<TableBadgeCell variant="secondary">System</TableBadgeCell>)
    expect(screen.getByText('System')).toBeInTheDocument()
  })
})

describe('withColumnWidth', () => {
  it('merges width preset into column meta', () => {
    const col = withColumnWidth<Row>({ accessorKey: 'name', header: 'Name' }, 'compact')
    expect(col.meta).toMatchObject(dataTableWidthMeta('compact'))
  })
})
