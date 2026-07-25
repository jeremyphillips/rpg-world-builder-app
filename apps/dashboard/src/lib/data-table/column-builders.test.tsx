import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import type { ColumnDef } from '@rpg/ui'

import {
  CollectionSummaryCell,
  dataTableColumnMeta,
  dataTableWidthMeta,
  NameCell,
  TableBadgeCell,
} from '@rpg/ui'

import {
  buildCollectionCountColumn,
  buildNameColumn,
  buildSourceColumn,
  stampDataColumns,
  withColumnWidth,
} from './column-builders'

type Row = { id: string; name: string; source: 'system' | 'homebrew' }

const SOURCE_BADGE = {
  system: { appearance: 'neutral' as const, tone: 'neutral' as const, label: 'System' },
  homebrew: { appearance: 'outline' as const, tone: 'neutral' as const, label: 'Homebrew' },
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
    expect(col.meta).toMatchObject({
      ...dataTableColumnMeta.identity,
      ...dataTableWidthMeta('title'),
      label: 'Name',
      locked: true,
    })

    render(<NameCell>Barbarian</NameCell>)
    expect(screen.getByText('Barbarian')).toBeInTheDocument()
  })
})

describe('buildSourceColumn', () => {
  it('uses source tone, compact width, and TableBadgeCell', () => {
    const col = buildSourceColumn<Row, 'system' | 'homebrew'>({ badgeMap: SOURCE_BADGE })
    expect(col.meta).toMatchObject({
      ...dataTableColumnMeta.source,
      ...dataTableWidthMeta('compact'),
    })

    render(
      <TableBadgeCell appearance="neutral" tone="neutral">
        System
      </TableBadgeCell>,
    )
    expect(screen.getByText('System')).toBeInTheDocument()
  })
})

describe('withColumnWidth', () => {
  it('merges width preset into column meta', () => {
    const col = withColumnWidth<Row>({ accessorKey: 'name', header: 'Name' }, 'compact')
    expect(col.meta).toMatchObject(dataTableWidthMeta('compact'))
  })
})

describe('buildCollectionCountColumn', () => {
  it('sorts by numeric count and renders CollectionSummaryCell', () => {
    const col = buildCollectionCountColumn<Row & { traits: { id: string; label: string }[] }>({
      id: 'traits',
      label: 'Traits',
      getItems: (row) => row.traits,
      getCount: (row) => row.traits.length,
      singularLabel: 'trait',
      pluralLabel: 'traits',
    })

    expect(col.meta).toMatchObject({
      ...dataTableColumnMeta.data,
      ...dataTableWidthMeta('collectionCount'),
      label: 'Traits',
    })

    render(
      <CollectionSummaryCell
        items={[
          { id: 'darkvision', label: 'Darkvision' },
          { id: 'dwarven-resilience', label: 'Dwarven Resilience' },
        ]}
        singularLabel="trait"
        pluralLabel="traits"
      />,
    )
    expect(screen.getByRole('button', { name: /2 traits/i })).toBeInTheDocument()
  })
})
