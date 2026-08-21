/**
 * @vitest-environment jsdom
 */
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'

import { AddPendingWorkflow } from './add-pending-workflow'

describe('AddPendingWorkflow', () => {
  it('renders empty resting state instead of composing when emptyState is provided', async () => {
    const user = userEvent.setup()
    const onAddAnother = vi.fn()
    render(
      <AddPendingWorkflow
        hasPendingItems={false}
        mode="pending"
        addAnotherLabel="+ Add another"
        addFirstLabel="+ Add first"
        onAddAnother={onAddAnother}
        emptyState={<p>No items yet.</p>}
        pendingItems={null}
        composing={<p>Composing content</p>}
      />,
    )

    expect(screen.getByText('No items yet.')).toBeInTheDocument()
    expect(screen.queryByText('Composing content')).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: '+ Add first' }))
    expect(onAddAnother).toHaveBeenCalledOnce()
  })

  it('keeps Add-mode composing exclusive of the pending collection', () => {
    render(
      <AddPendingWorkflow
        hasPendingItems={false}
        addAnotherLabel="+ Add another"
        onAddAnother={vi.fn()}
        pendingHeading="Pending relationships"
        pendingItems={<p>Pending row</p>}
        composing={<p>Composing content</p>}
      />,
    )

    expect(screen.getByText('Composing content')).toBeInTheDocument()
    expect(screen.queryByText('Pending row')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: '+ Add another' })).not.toBeInTheDocument()
  })

  it('keeps Pending-mode review exclusive of Add-mode composing', () => {
    render(
      <AddPendingWorkflow
        hasPendingItems
        mode="pending"
        addAnotherLabel="+ Add another"
        onAddAnother={vi.fn()}
        pendingHeading="Pending relationships"
        pendingItems={<p>Pending row</p>}
        composing={<p>Composing content</p>}
      />,
    )

    expect(screen.getByText('Pending row')).toBeInTheDocument()
    expect(screen.queryByText('Composing content')).not.toBeInTheDocument()
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
        composing={<p>Composing content</p>}
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
        composing={<p>Composing content</p>}
      />,
    )

    expect(screen.getByText('Composing content')).toBeInTheDocument()
    expect(screen.queryByText('Pending row')).not.toBeInTheDocument()
  })

  itAxe('has no accessibility violations in Add mode', async () => {
    const { container } = render(
      <AddPendingWorkflow
        hasPendingItems={false}
        addAnotherLabel="+ Add another"
        onAddAnother={vi.fn()}
        composing={<p>Composing content</p>}
        pendingItems={null}
      />,
    )
    await expectNoAxeViolations(container)
  })
})
