import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expectNoAxeViolations } from '@rpg/ui/test-utils'
import { describe, expect, it, vi } from 'vitest'

import { CatalogToolbar } from './catalog-toolbar.client'

describe('CatalogToolbar', () => {
  it('omits search when the search prop is not provided', () => {
    render(
      <CatalogToolbar
        primaryControls={<span>Filters only</span>}
        actions={<button type="button">Reset</button>}
      />,
    )

    expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
    expect(screen.getByText('Filters only')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Reset' })).toBeInTheDocument()
  })

  it('renders tabs before search by default', () => {
    render(
      <CatalogToolbar
        search={{ query: '', onQueryChange: vi.fn(), placeholder: 'Search catalog' }}
        tabs={{
          items: [
            { id: 'featured', label: 'Featured', count: 1 },
            { id: 'all', label: 'All', count: 2 },
          ],
          activeId: 'featured',
          onActiveIdChange: vi.fn(),
        }}
      />,
    )

    const tablist = screen.getByRole('tablist')
    const search = screen.getByRole('textbox', { name: 'Search catalog' })
    expect(tablist.compareDocumentPosition(search) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })

  it('renders tabs after search when position is after-search', () => {
    render(
      <CatalogToolbar
        search={{ query: '', onQueryChange: vi.fn(), placeholder: 'Search catalog' }}
        tabs={{
          items: [{ id: 'featured', label: 'Featured', count: 1 }],
          activeId: 'featured',
          onActiveIdChange: vi.fn(),
          position: 'after-search',
        }}
      />,
    )

    const tablist = screen.getByRole('tablist')
    const search = screen.getByRole('textbox', { name: 'Search catalog' })
    expect(search.compareDocumentPosition(tablist) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })

  it('places actions in the tab row when tabs are present', () => {
    render(
      <CatalogToolbar
        search={{ query: '', onQueryChange: vi.fn(), placeholder: 'Search catalog' }}
        tabs={{
          items: [{ id: 'featured', label: 'Featured', count: 1 }],
          activeId: 'featured',
          onActiveIdChange: vi.fn(),
        }}
        actions={<button type="button">Reset view</button>}
      />,
    )

    const tablist = screen.getByRole('tablist')
    const resetButton = screen.getByRole('button', { name: 'Reset view' })
    expect(tablist.parentElement?.parentElement).toContainElement(resetButton)
  })

  it('aligns actions with the filter row when tabs are absent', () => {
    render(
      <CatalogToolbar
        filterRow={{
          controls: <span>Controls</span>,
          actions: <span>Sort</span>,
        }}
        actions={<button type="button">Reset view</button>}
      />,
    )

    const controls = screen.getByText('Controls')
    const sort = screen.getByText('Sort')
    const resetButton = screen.getByRole('button', { name: 'Reset view' })

    expect(controls.parentElement?.parentElement).toContainElement(sort)
    expect(sort.parentElement).toContainElement(resetButton)
  })

  it('renders a standalone actions row when only actions are provided', () => {
    render(<CatalogToolbar actions={<button type="button">Reset view</button>} />)

    expect(screen.getByRole('button', { name: 'Reset view' })).toBeInTheDocument()
  })

  it('updates search query through the controlled search prop', async () => {
    const user = userEvent.setup()
    const onQueryChange = vi.fn()

    render(<CatalogToolbar search={{ query: '', onQueryChange, placeholder: 'Search catalog' }} />)

    await user.type(screen.getByRole('textbox', { name: 'Search catalog' }), 'rope')
    expect(onQueryChange).toHaveBeenCalled()
  })

  it('has no axe accessibility violations', async () => {
    const { container } = render(
      <CatalogToolbar
        search={{ query: 'alpha', onQueryChange: vi.fn(), placeholder: 'Search catalog' }}
        filterRow={{
          controls: <span>Controls</span>,
          actions: <span>Sort</span>,
        }}
        actions={<button type="button">Reset view</button>}
      />,
    )

    await expectNoAxeViolations(container)
  })
})
