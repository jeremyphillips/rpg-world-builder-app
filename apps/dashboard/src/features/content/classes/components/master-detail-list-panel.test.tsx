import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import axe from 'axe-core'
import { describe, expect, it, vi } from 'vitest'

import { MasterDetailListPanel } from './master-detail-list-panel.client'

const axeOptions = { rules: { 'color-contrast': { enabled: false } } }

const items = [
  { id: 'a', title: 'Rage' },
  { id: 'b', title: 'Unarmored Defense' },
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

    await user.click(screen.getByRole('button', { name: 'Unarmored Defense' }))
    expect(props.onSelect).toHaveBeenCalledWith(1)
  })

  it('calls onRemove with the row index', async () => {
    const user = userEvent.setup()
    const props = baseProps()
    render(<MasterDetailListPanel {...props} />)

    await user.click(screen.getByRole('button', { name: /Remove Rage/i }))
    expect(props.onRemove).toHaveBeenCalledWith(0)
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
