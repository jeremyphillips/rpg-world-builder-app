import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expectNoAxeViolations } from '@rpg/ui/test-utils'

import { CrossContentRelationshipRow } from './cross-content-relationship-row.client'

describe('CrossContentRelationshipRow', () => {
  it('renders populated relationship content without empty-state affordances', () => {
    render(
      <CrossContentRelationshipRow
        relationshipEyebrow="Governs"
        heading="The Monarchy"
        subheading="Government"
      />,
    )

    expect(screen.getByText('Governs')).toBeInTheDocument()
    expect(screen.getByText('The Monarchy')).toBeInTheDocument()
    expect(screen.getByText('Government')).toBeInTheDocument()
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

  it('has no axe accessibility violations', async () => {
    const { container } = render(
      <CrossContentRelationshipRow
        heading="The Monarchy"
        subheading="Government"
        actions={[{ id: 'view', label: 'View organization', onSelect: () => undefined }]}
        overflowTriggerLabel="Relationship actions"
      />,
    )

    await expectNoAxeViolations(container)
  })
})
