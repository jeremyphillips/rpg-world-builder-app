/**
 * @vitest-environment jsdom
 */
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'

import { AddPendingWorkflow } from '@/lib/create-flow'

import { AddPendingDisclosureCard } from './add-pending-disclosure-card.client'
import { SILVER_CIRCLE_ENTITY } from './entity.fixture'

describe('AddPendingDisclosureCard', () => {
  it('keeps ContentEntityCard collapsed until Add expands DisclosureEntityCard', async () => {
    const user = userEvent.setup()
    render(
      <AddPendingWorkflow
        hasPendingItems={false}
        addAnotherLabel="+ Add another"
        onAddAnother={vi.fn()}
        pendingItems={null}
        addDiscovery={
          <AddPendingDisclosureCard itemId="org-1" entity={SILVER_CIRCLE_ENTITY}>
            <p>Relationship composer</p>
          </AddPendingDisclosureCard>
        }
      />,
    )

    expect(screen.getByRole('button', { name: 'Add' })).toBeInTheDocument()
    expect(screen.queryByText('Relationship composer')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Add' }))
    expect(screen.getByText('Relationship composer')).toBeInTheDocument()
  })

  it('does not open an empty composer when Add is disabled', async () => {
    const user = userEvent.setup()
    const onAdd = vi.fn()
    render(
      <AddPendingDisclosureCard
        itemId="org-1"
        entity={SILVER_CIRCLE_ENTITY}
        addDisabled
        addDisabledReason="No eligible relationships for this Organization."
        onAdd={onAdd}
      >
        <p>Relationship composer</p>
      </AddPendingDisclosureCard>,
    )

    const addButton = screen.getByRole('button', { name: /Add/ })
    expect(addButton).toBeDisabled()
    expect(screen.getByText('No eligible relationships for this Organization.')).toBeInTheDocument()
    await user.click(addButton)
    expect(onAdd).not.toHaveBeenCalled()
    expect(screen.queryByText('Relationship composer')).not.toBeInTheDocument()
  })

  it('transfers expansion so only one discovery card is open', async () => {
    const user = userEvent.setup()
    render(
      <AddPendingWorkflow
        hasPendingItems={false}
        addAnotherLabel="+ Add another"
        onAddAnother={vi.fn()}
        pendingItems={null}
        addDiscovery={
          <>
            <AddPendingDisclosureCard itemId="org-1" entity={SILVER_CIRCLE_ENTITY}>
              <p>Composer one</p>
            </AddPendingDisclosureCard>
            <AddPendingDisclosureCard
              itemId="org-2"
              entity={{ heading: 'Harbor Merchants', classification: 'Commercial' }}
            >
              <p>Composer two</p>
            </AddPendingDisclosureCard>
          </>
        }
      />,
    )

    const addButtons = screen.getAllByRole('button', { name: 'Add' })
    await user.click(addButtons[0]!)
    expect(screen.getByText('Composer one')).toBeInTheDocument()
    await user.click(addButtons[1]!)
    expect(screen.queryByText('Composer one')).not.toBeInTheDocument()
    expect(screen.getByText('Composer two')).toBeInTheDocument()
  })

  itAxe('has no accessibility violations when collapsed', async () => {
    const { container } = render(
      <AddPendingDisclosureCard itemId="org-1" entity={SILVER_CIRCLE_ENTITY} />,
    )
    await expectNoAxeViolations(container)
  })
})
