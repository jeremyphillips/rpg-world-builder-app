import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { DetailOverflowMenu } from './detail-overflow-menu'

describe('DetailOverflowMenu', () => {
  it('returns null when actions are empty', () => {
    const { container } = render(<DetailOverflowMenu actions={[]} triggerLabel="Actions" />)
    expect(container).toBeEmptyDOMElement()
  })

  it('renders menu items and invokes onSelect', async () => {
    const user = userEvent.setup()
    const onView = vi.fn()

    render(
      <DetailOverflowMenu
        actions={[
          { id: 'view', label: 'View location', onSelect: onView },
          { id: 'remove', label: 'Remove', destructive: true, onSelect: vi.fn() },
        ]}
        triggerLabel="Actions for The Silver Eel"
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Actions for The Silver Eel' }))
    await user.click(screen.getByRole('menuitem', { name: 'View location' }))
    expect(onView).toHaveBeenCalledOnce()
  })

  it('applies destructive styling to destructive menu items', async () => {
    const user = userEvent.setup()

    render(
      <DetailOverflowMenu
        actions={[{ id: 'remove', label: 'Remove', destructive: true, onSelect: vi.fn() }]}
        triggerLabel="Actions"
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Actions' }))
    expect(screen.getByRole('menuitem', { name: 'Remove' })).toHaveClass('text-destructive')
  })
})
