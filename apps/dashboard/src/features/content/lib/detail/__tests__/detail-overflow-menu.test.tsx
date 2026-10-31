import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { detailOverflowDeleteAction } from '../detail-overflow-actions'
import { DetailOverflowMenu } from '../detail-overflow-menu'

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

  it('renders delete actions with a trash icon via detailOverflowDeleteAction', async () => {
    const user = userEvent.setup()

    render(
      <DetailOverflowMenu
        actions={[detailOverflowDeleteAction('Delete trait', vi.fn())]}
        triggerLabel="Actions"
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Actions' }))
    expect(screen.getByRole('menuitem', { name: 'Delete trait' })).toBeInTheDocument()
    expect(screen.getByRole('menuitem', { name: 'Delete trait' }).querySelector('svg')).toBeTruthy()
  })

  it('renders a flat labeled group of destinations', async () => {
    const user = userEvent.setup()
    const onBonus = vi.fn()

    render(
      <DetailOverflowMenu
        actions={[
          {
            id: 'move-to',
            label: 'Move to',
            items: [
              { id: 'bonus', label: 'Bonus actions', onSelect: onBonus },
              { id: 'reactions', label: 'Reactions', onSelect: vi.fn() },
            ],
          },
          {
            id: 'delete',
            label: 'Delete action',
            destructive: true,
            separatorBefore: true,
            onSelect: vi.fn(),
          },
        ]}
        triggerLabel="Actions for Bite"
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Actions for Bite' }))
    expect(screen.getByText('Move to')).toBeInTheDocument()
    expect(screen.queryByRole('menu', { name: 'Move to' })).not.toBeInTheDocument()
    await user.click(screen.getByRole('menuitem', { name: 'Bonus actions' }))
    expect(onBonus).toHaveBeenCalledOnce()
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
