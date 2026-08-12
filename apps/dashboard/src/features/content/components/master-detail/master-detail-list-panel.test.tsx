import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'
import { describe, expect, it, vi } from 'vitest'

import { MasterDetailListPanel, type MasterDetailListItem } from './master-detail-list-panel.client'
import { resolveMasterDetailListMove } from '../../lib/master-detail/master-detail-list-move'

const items: MasterDetailListItem[] = [
  { id: 'a', title: 'Rage', eyebrow: 'Level 1' },
  { id: 'b', title: 'Unarmored Defense', eyebrow: 'Level 1' },
]

function baseProps() {
  return {
    items,
    selectedIndex: 0,
    ariaLabel: 'Features',
    addLabel: 'Add feature',
    emptyLabel: 'No features yet. Add one to get started.',
    onAdd: vi.fn(),
    onSelect: vi.fn(),
    onRemove: vi.fn(),
  }
}

describe('MasterDetailListPanel', () => {
  it('calls onAdd when the add button is clicked', async () => {
    const user = userEvent.setup()
    const props = baseProps()
    render(<MasterDetailListPanel {...props} />)

    await user.click(screen.getByRole('button', { name: /Add feature/i }))
    expect(props.onAdd).toHaveBeenCalledOnce()
  })

  it('calls onSelect with the row index', async () => {
    const user = userEvent.setup()
    const props = baseProps()
    render(<MasterDetailListPanel {...props} />)

    await user.click(screen.getByRole('button', { name: /^(?!Remove|Drag).*Unarmored Defense/ }))
    expect(props.onSelect).toHaveBeenCalledWith(1)
  })

  it('calls onRemove with the row index', async () => {
    const user = userEvent.setup()
    const props = baseProps()
    render(<MasterDetailListPanel {...props} />)

    await user.click(screen.getByRole('button', { name: /Remove Rage/i }))
    expect(props.onRemove).toHaveBeenCalledWith(0)
  })

  it('renders classification through EntityItem and hides protected row removal', () => {
    const protectedItems: MasterDetailListItem[] = [
      {
        id: 'a',
        title: 'Rage',
        eyebrow: 'Level 1',
        badges: [{ label: 'System', appearance: 'neutral', tone: 'neutral' }],
        deletable: false,
      },
    ]
    render(<MasterDetailListPanel {...baseProps()} items={protectedItems} />)

    expect(screen.getByText('Level 1')).toBeInTheDocument()
    expect(screen.getByText('System')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Remove Rage/i })).not.toBeInTheDocument()
  })

  it('renders the empty label when there are no items', () => {
    render(<MasterDetailListPanel {...baseProps()} items={[]} selectedIndex={null} />)
    expect(screen.getByText(/No features yet/i)).toBeInTheDocument()
  })

  it('renders a validation error indicator for rows with hasError', () => {
    const errorItems: MasterDetailListItem[] = [
      { id: 'a', title: 'Rage', eyebrow: 'Level 1', hasError: true },
    ]
    render(<MasterDetailListPanel {...baseProps()} items={errorItems} />)

    expect(screen.getByText('Has validation errors')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Rage' })).toHaveAttribute('aria-invalid', 'true')
  })

  it('renders drag handles when onMove is provided and hides them for a single item', () => {
    const onMove = vi.fn()
    const { rerender } = render(<MasterDetailListPanel {...baseProps()} onMove={onMove} />)

    expect(screen.getByRole('button', { name: /Drag to reorder Rage/i })).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /Drag to reorder Unarmored Defense/i }),
    ).toBeInTheDocument()

    rerender(
      <MasterDetailListPanel
        {...baseProps()}
        items={[{ id: 'a', title: 'Rage', eyebrow: 'Level 1' }]}
        onMove={onMove}
      />,
    )

    expect(screen.queryByRole('button', { name: /Drag to reorder/i })).not.toBeInTheDocument()
  })

  it('does not render drag handles when onMove is omitted', () => {
    render(<MasterDetailListPanel {...baseProps()} />)
    expect(screen.queryByRole('button', { name: /Drag to reorder/i })).not.toBeInTheDocument()
  })

  it('calls onMove with from/to indices when a drag ends on a new position', () => {
    const onMove = vi.fn()
    render(<MasterDetailListPanel {...baseProps()} onMove={onMove} />)

    const move = resolveMasterDetailListMove(items, {
      active: { id: 'b' },
      over: { id: 'a' },
    } as Parameters<typeof resolveMasterDetailListMove>[1])

    expect(move).toEqual({ from: 1, to: 0 })
    if (move) onMove(move.from, move.to)
    expect(onMove).toHaveBeenCalledWith(1, 0)
  })

  itAxe('has no axe accessibility violations', async () => {
    const { container } = render(<MasterDetailListPanel {...baseProps()} onMove={vi.fn()} />)
    await expectNoAxeViolations(container)
  })
})
