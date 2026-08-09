import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'

import { RelationshipContentRow } from './relationship-content-row.client'

describe('RelationshipContentRow', () => {
  it('renders empty copy with an inline add action', async () => {
    const user = userEvent.setup()
    const onAdd = vi.fn()

    render(
      <RelationshipContentRow
        emptyLabel="No people or organizations linked."
        addLabel="Add relationship"
        onAdd={onAdd}
      />,
    )

    expect(screen.getByText('No people or organizations linked.')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Add relationship' }))
    expect(onAdd).toHaveBeenCalledOnce()
  })

  it('renders empty copy alone when no add action is supplied', () => {
    render(<RelationshipContentRow emptyLabel="No governing organization." />)

    expect(screen.getByText('No governing organization.')).toBeInTheDocument()
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('renders the add action alone for populated unlabeled groups', async () => {
    const user = userEvent.setup()
    const onAdd = vi.fn()

    render(<RelationshipContentRow addLabel="Add relationship" onAdd={onAdd} />)

    await user.click(screen.getByRole('button', { name: 'Add relationship' }))
    expect(onAdd).toHaveBeenCalledOnce()
  })

  itAxe('has no axe accessibility violations', async () => {
    const { container } = render(
      <RelationshipContentRow emptyLabel="No organizations claim this location." />,
    )
    await expectNoAxeViolations(container)
  })
})
