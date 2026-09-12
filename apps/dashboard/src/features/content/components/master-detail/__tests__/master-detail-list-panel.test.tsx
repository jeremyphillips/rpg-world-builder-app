import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'
import { describe, expect, it, vi } from 'vitest'

import { MasterDetailListPanel, type MasterDetailListItem } from '../master-detail-list-panel'

const items: MasterDetailListItem[] = [
  {
    id: 'a',
    title: 'Rage',
    meta: { eyebrow: 'Level 1', sourceLabel: 'System' },
  },
  {
    id: 'b',
    title: 'Unarmored Defense',
    meta: { eyebrow: 'Level 1', sourceLabel: 'Homebrew' },
  },
]

function baseProps() {
  return {
    items,
    selectedIndex: 0,
    listTitle: 'Features',
    ariaLabel: 'Features',
    addLabel: 'Add feature',
    emptyLabel: 'No features yet.\nAdd a feature to configure its level, grants, and description.',
    onAdd: vi.fn(),
    onSelect: vi.fn(),
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

  it('calls onSelect with the row index when the whole row is clicked', async () => {
    const user = userEvent.setup()
    const props = baseProps()
    render(<MasterDetailListPanel {...props} />)

    await user.click(screen.getByRole('button', { name: /Unarmored Defense/i }))
    expect(props.onSelect).toHaveBeenCalledWith(1)
  })

  it('joins structured meta for the row subtitle', () => {
    render(<MasterDetailListPanel {...baseProps()} />)

    expect(screen.getByText('Level 1 · System')).toBeInTheDocument()
    expect(screen.getByText('Level 1 · Homebrew')).toBeInTheDocument()
  })

  it('renders the empty label when there are no items', () => {
    render(<MasterDetailListPanel {...baseProps()} items={[]} selectedIndex={null} />)
    expect(screen.getByText(/No features yet/i)).toBeInTheDocument()
    expect(
      screen.getByText(/Add a feature to configure its level, grants, and description/i),
    ).toBeInTheDocument()
  })

  it('marks rows with validation errors', () => {
    const errorItems: MasterDetailListItem[] = [
      {
        id: 'a',
        title: 'Rage',
        meta: { eyebrow: 'Level 1', sourceLabel: 'System' },
        hasError: true,
      },
    ]
    render(<MasterDetailListPanel {...baseProps()} items={errorItems} />)

    expect(screen.getByText('Has validation errors')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Rage/i })).toHaveAttribute('aria-invalid', 'true')
  })

  it('does not render row delete or drag controls', () => {
    render(<MasterDetailListPanel {...baseProps()} />)

    expect(screen.queryByRole('button', { name: /Remove/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Drag to reorder/i })).not.toBeInTheDocument()
  })

  itAxe('has no axe accessibility violations', async () => {
    const { container } = render(<MasterDetailListPanel {...baseProps()} />)
    await expectNoAxeViolations(container)
  })
})
