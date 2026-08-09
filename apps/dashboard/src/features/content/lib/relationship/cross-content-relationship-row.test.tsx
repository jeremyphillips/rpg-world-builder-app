import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'

import { CrossContentRelationshipRow } from './cross-content-relationship-row.client'

describe('CrossContentRelationshipRow', () => {
  it('renders optional secondaryText when supplied', () => {
    render(<CrossContentRelationshipRow heading="Grey Watch" secondaryText="Military" />)

    expect(screen.getByText('Grey Watch')).toBeInTheDocument()
    expect(screen.getByText('Military')).toBeInTheDocument()
  })

  it('passes headingSuffix outside the entity link', () => {
    render(
      <MemoryRouter>
        <CrossContentRelationshipRow
          heading="Yawning Portal"
          href="/locations/yawning-portal"
          headingSuffix=" · Building · Tavern"
        />
      </MemoryRouter>,
    )

    const link = screen.getByRole('link', { name: 'Yawning Portal' })
    expect(link).toHaveAttribute('href', '/locations/yawning-portal')
    expect(link.closest('div')?.textContent).toContain('Building · Tavern')
    expect(link.textContent).toBe('Yawning Portal')
    expect(link.closest('div')?.querySelector('[aria-hidden="true"]')).toHaveTextContent('·')
  })

  it('composes DetailEntityRow link treatment and DetailOverflowMenu when href and actions are provided', () => {
    render(
      <MemoryRouter>
        <CrossContentRelationshipRow
          heading="The Monarchy"
          href="/organizations/monarchy"
          actions={[{ id: 'view', label: 'View organization', onSelect: vi.fn() }]}
          overflowTriggerLabel="Relationship actions"
        />
      </MemoryRouter>,
    )

    expect(screen.getByRole('link', { name: 'The Monarchy' })).toHaveAttribute(
      'href',
      '/organizations/monarchy',
    )
    expect(screen.getByRole('button', { name: 'Relationship actions' })).toBeInTheDocument()
  })

  it('omits DetailOverflowMenu when actions are empty', () => {
    render(<CrossContentRelationshipRow heading="The Monarchy" />)

    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('uses an explicit endSlot override instead of convenience overflow', () => {
    render(
      <CrossContentRelationshipRow
        heading="The Monarchy"
        actions={[{ id: 'view', label: 'View organization', onSelect: vi.fn() }]}
        endSlot={<button type="button">Utility</button>}
      />,
    )

    expect(screen.getByRole('button', { name: 'Utility' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Relationship actions' })).not.toBeInTheDocument()
  })

  it('suppresses trailing controls when endSlot is null', () => {
    render(
      <CrossContentRelationshipRow
        heading="The Monarchy"
        actions={[{ id: 'view', label: 'View organization', onSelect: vi.fn() }]}
        endSlot={null}
      />,
    )

    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('renders overflow actions from feature-supplied items', async () => {
    const user = userEvent.setup()
    const onRemove = vi.fn()

    render(
      <CrossContentRelationshipRow
        heading="The Monarchy"
        actions={[
          { id: 'remove', label: 'Remove authority', destructive: true, onSelect: onRemove },
        ]}
        overflowTriggerLabel="Relationship actions"
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Relationship actions' }))
    await user.click(screen.getByRole('menuitem', { name: 'Remove authority' }))
    expect(onRemove).toHaveBeenCalledOnce()
  })

  itAxe('has no axe accessibility violations', async () => {
    const { container } = render(
      <CrossContentRelationshipRow
        heading="The Monarchy"
        secondaryText="Government"
        actions={[{ id: 'view', label: 'View organization', onSelect: () => undefined }]}
        overflowTriggerLabel="Relationship actions"
      />,
    )

    await expectNoAxeViolations(container)
  })
})
