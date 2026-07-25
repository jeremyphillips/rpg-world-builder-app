/**
 * @vitest-environment jsdom
 */
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { expectNoAxeViolations } from '@rpg/ui/test-utils'
import type { ColumnDef } from '@rpg/ui'

import { OverviewTableFrame } from './overview-table-frame.client'

type Row = {
  id: string
  name: string
}

const ROWS: Row[] = [
  { id: '1', name: 'Alpha' },
  { id: '2', name: 'Beta' },
]

const COLUMNS: ColumnDef<Row>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
    meta: { label: 'Name' },
  },
]

describe('OverviewTableFrame', () => {
  it('renders with minimal props and no utility chrome', async () => {
    const { container } = render(
      <OverviewTableFrame
        columns={COLUMNS}
        data={ROWS}
        caption="Example overview frame"
        emptyState={<p>No rows</p>}
      />,
    )

    expect(screen.getByText('Alpha')).toBeInTheDocument()
    expect(screen.getByText('Example overview frame')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Choose visible columns' })).not.toBeInTheDocument()

    await expectNoAxeViolations(container)
  })

  it('renders summary and utility action slots', () => {
    render(
      <OverviewTableFrame
        columns={COLUMNS}
        data={ROWS}
        summary={<span>2 results</span>}
        utilityActions={(controls) => (
          <controls.ColumnVisibilityTrigger aria-label="Choose visible columns" showLabel={false} />
        )}
      />,
    )

    expect(screen.getByText('2 results')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Choose visible columns' })).toBeInTheDocument()
  })
})
