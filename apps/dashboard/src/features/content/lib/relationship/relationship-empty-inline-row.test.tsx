import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { expectNoAxeViolations } from '@rpg/ui/test-utils'

import { RelationshipEmptyInlineRow } from './relationship-empty-inline-row.client'

describe('RelationshipEmptyInlineRow', () => {
  it('renders empty copy with an inline add action', async () => {
    const user = userEvent.setup()
    const onAdd = vi.fn()

    render(
      <RelationshipEmptyInlineRow
        emptyLabel="No controlling organization."
        addLabel="Add organization"
        onAdd={onAdd}
      />,
    )

    expect(screen.getByText('No controlling organization.')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Add organization' }))
    expect(onAdd).toHaveBeenCalledOnce()
  })

  it('has no axe accessibility violations', async () => {
    const { container } = render(
      <RelationshipEmptyInlineRow emptyLabel="No organizations claim this location." />,
    )
    await expectNoAxeViolations(container)
  })
})
