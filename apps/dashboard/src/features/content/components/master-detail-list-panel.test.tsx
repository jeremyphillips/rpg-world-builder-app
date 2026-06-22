import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import axe from 'axe-core'
import { describe, expect, it, vi } from 'vitest'

import { MasterDetailListPanel, type MasterDetailListItem } from './master-detail-list-panel.client'

const axeOptions = { rules: { 'color-contrast': { enabled: false } } }

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

    await user.click(screen.getByRole('button', { name: /^(?!Remove).*Unarmored Defense/ }))
    expect(props.onSelect).toHaveBeenCalledWith(1)
  })

  it('calls onRemove with the row index', async () => {
    const user = userEvent.setup()
    const props = baseProps()
    render(<MasterDetailListPanel {...props} />)

    await user.click(screen.getByRole('button', { name: /Remove Rage/i }))
    expect(props.onRemove).toHaveBeenCalledWith(0)
  })

  it('renders the eyebrow and hides the remove control for protected rows', () => {
    const protectedItems: MasterDetailListItem[] = [
      { id: 'a', title: 'Rage', eyebrow: 'Level 1', badge: { label: 'System' }, deletable: false },
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

  it('has no axe accessibility violations', async () => {
    const { container } = render(<MasterDetailListPanel {...baseProps()} />)
    const results = await axe.run(container, axeOptions)
    expect(results.violations).toEqual([])
  })
})
