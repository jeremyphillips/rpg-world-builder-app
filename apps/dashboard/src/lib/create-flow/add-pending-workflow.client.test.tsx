/**
 * @vitest-environment jsdom
 */
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'

import { AddPendingWorkflow } from './add-pending-workflow.client'

describe('AddPendingWorkflow', () => {
  it('keeps Add-mode discovery exclusive of the pending collection', () => {
    render(
      <AddPendingWorkflow
        hasPendingItems={false}
        addAnotherLabel="+ Add another"
        onAddAnother={vi.fn()}
        pendingHeading="Pending relationships"
        pendingItems={<p>Pending row</p>}
        addDescription={<p>Search or create an item.</p>}
        addSearch={<input aria-label="Search items" />}
        addDiscovery={<p>Discovery row</p>}
        addAlternateAction={<button type="button">Create new</button>}
      />,
    )

    expect(screen.getByText('Search or create an item.')).toBeInTheDocument()
    expect(screen.getByText('Discovery row')).toBeInTheDocument()
    expect(screen.queryByText('Pending row')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: '+ Add another' })).not.toBeInTheDocument()
  })

  it('keeps Pending-mode review exclusive of Add-mode discovery', () => {
    render(
      <AddPendingWorkflow
        hasPendingItems
        mode="pending"
        addAnotherLabel="+ Add another"
        onAddAnother={vi.fn()}
        pendingHeading="Pending relationships"
        pendingItems={<p>Pending row</p>}
        addDescription={<p>Search or create an item.</p>}
        addSearch={<input aria-label="Search items" />}
        addDiscovery={<p>Discovery row</p>}
      />,
    )

    expect(screen.getByText('Pending row')).toBeInTheDocument()
    expect(screen.queryByText('Discovery row')).not.toBeInTheDocument()
    expect(screen.queryByLabelText('Search items')).not.toBeInTheDocument()
  })

  it('returns to Add mode from add-another and when the last pending item is gone', async () => {
    const user = userEvent.setup()
    const onAddAnother = vi.fn()
    const onModeChange = vi.fn()
    const { rerender } = render(
      <AddPendingWorkflow
        hasPendingItems
        mode="pending"
        onModeChange={onModeChange}
        addAnotherLabel="+ Add another"
        onAddAnother={onAddAnother}
        pendingItems={<p>Pending row</p>}
        addDiscovery={<p>Discovery row</p>}
      />,
    )

    await user.click(screen.getByRole('button', { name: '+ Add another' }))
    expect(onAddAnother).toHaveBeenCalledOnce()
    expect(onModeChange).toHaveBeenCalledWith('add')

    rerender(
      <AddPendingWorkflow
        hasPendingItems={false}
        mode="pending"
        onModeChange={onModeChange}
        addAnotherLabel="+ Add another"
        onAddAnother={onAddAnother}
        pendingItems={<p>Pending row</p>}
        addDiscovery={<p>Discovery row</p>}
      />,
    )

    expect(screen.getByText('Discovery row')).toBeInTheDocument()
    expect(screen.queryByText('Pending row')).not.toBeInTheDocument()
  })

  it('shows the Add-mode branch instead of discovery', () => {
    render(
      <AddPendingWorkflow
        hasPendingItems={false}
        addAnotherLabel="+ Add another"
        onAddAnother={vi.fn()}
        pendingItems={null}
        addDiscovery={<p>Discovery row</p>}
        addBranch={<p>New item form</p>}
        addBranchBackLabel="Choose existing"
        onAddBranchBack={vi.fn()}
      />,
    )

    expect(screen.getByText('New item form')).toBeInTheDocument()
    expect(screen.queryByText('Discovery row')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Choose existing' })).toBeInTheDocument()
  })

  itAxe('has no accessibility violations in Add mode', async () => {
    const { container } = render(
      <AddPendingWorkflow
        hasPendingItems={false}
        addAnotherLabel="+ Add another"
        onAddAnother={vi.fn()}
        addDescription={<p>Search or create an item.</p>}
        addDiscovery={<p>Discovery row</p>}
        pendingItems={null}
      />,
    )
    await expectNoAxeViolations(container)
  })
})
