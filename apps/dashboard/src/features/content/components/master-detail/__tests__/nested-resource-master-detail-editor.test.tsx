import type { ReactNode } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { TRAIT_MASTER_DETAIL_ITEM_NOUN } from '../../../species/lib/species-trait-form-labels'
import {
  masterDetailEmptyListLabel,
  masterDetailEmptySelectionHeading,
} from '../../../lib/master-detail/master-detail-constants'
import { NestedResourceMasterDetailEditor } from '../nested-resource-master-detail-editor'
import type { MasterDetailListItem } from '../master-detail-list-panel'

const itemNoun = TRAIT_MASTER_DETAIL_ITEM_NOUN

const baseItems: MasterDetailListItem[] = [
  {
    id: 'row-a',
    title: 'Alpha',
    meta: { sourceLabel: 'System' },
    deletable: true,
  },
  {
    id: 'row-b',
    title: 'Beta',
    meta: { sourceLabel: 'Homebrew' },
    deletable: false,
  },
]

function EditorHarness({
  items = baseItems,
  selectedRowId = null as string | null,
  onSelectRow = vi.fn(),
  onAdd = vi.fn(),
  onDelete = vi.fn(),
  countSupplement,
}: {
  items?: MasterDetailListItem[]
  selectedRowId?: string | null
  onSelectRow?: (rowId: string) => void
  onAdd?: () => void
  onDelete?: () => void
  countSupplement?: ReactNode
}) {
  const selectedIdentity =
    selectedRowId === 'row-a'
      ? {
          title: 'Alpha',
          meta: { sourceLabel: 'System' },
          deletable: true,
        }
      : selectedRowId === 'row-b'
        ? {
            title: 'Beta',
            meta: { sourceLabel: 'Homebrew' },
            deletable: false,
          }
        : undefined

  return (
    <NestedResourceMasterDetailEditor
      items={items}
      selectedRowId={selectedRowId}
      onSelectRow={onSelectRow}
      onAdd={onAdd}
      listTitle="Traits"
      ariaLabel="Traits"
      addLabel="Add trait"
      itemNoun={itemNoun}
      countSupplement={countSupplement}
      selectedIdentity={selectedIdentity}
      onDelete={onDelete}
      renderDetail={({ rowId }) => <div data-testid={`detail-${rowId}`}>Detail for {rowId}</div>}
    />
  )
}

describe('NestedResourceMasterDetailEditor', () => {
  it('renders an empty list with the add control and empty detail state', () => {
    render(<EditorHarness items={[]} />)

    expect(screen.getByRole('button', { name: /Add trait/i })).toBeInTheDocument()
    expect(screen.getByText(masterDetailEmptyListLabel(itemNoun))).toBeInTheDocument()
    expect(screen.getByText(masterDetailEmptySelectionHeading(itemNoun))).toBeInTheDocument()
  })

  it('selects a row and renders detail content for the row id', async () => {
    const user = userEvent.setup()
    const onSelectRow = vi.fn()

    render(<EditorHarness onSelectRow={onSelectRow} />)

    await user.click(screen.getByRole('button', { name: /Alpha/i }))

    expect(onSelectRow).toHaveBeenCalledWith('row-a')
  })

  it('shows detail body and overflow delete when a row is selected', () => {
    render(<EditorHarness selectedRowId="row-a" />)

    expect(screen.getByTestId('detail-row-a')).toHaveTextContent('Detail for row-a')
    expect(screen.getByRole('button', { name: /Actions for Alpha/i })).toBeInTheDocument()
  })

  it('hides overflow delete for non-deletable rows', () => {
    render(<EditorHarness selectedRowId="row-b" />)

    expect(screen.queryByRole('button', { name: /Actions for Beta/i })).not.toBeInTheDocument()
  })

  it('calls onAdd from the list header', async () => {
    const user = userEvent.setup()
    const onAdd = vi.fn()

    render(<EditorHarness onAdd={onAdd} />)

    await user.click(screen.getByRole('button', { name: /Add trait/i }))
    expect(onAdd).toHaveBeenCalledOnce()
  })

  it('passes count supplement through to the list panel', () => {
    render(<EditorHarness countSupplement={<span>2 available</span>} />)

    expect(screen.getByText('2 available')).toBeInTheDocument()
  })

  it('calls onDelete through the overflow menu', async () => {
    const user = userEvent.setup()
    const onDelete = vi.fn()

    render(<EditorHarness selectedRowId="row-a" onDelete={onDelete} />)

    await user.click(screen.getByRole('button', { name: /Actions for Alpha/i }))
    await user.click(screen.getByRole('menuitem', { name: /Delete trait/i }))

    expect(onDelete).toHaveBeenCalledOnce()
  })
})
