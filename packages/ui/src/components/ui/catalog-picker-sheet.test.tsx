import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expectNoAxeViolations } from '@rpg/ui/test-utils'
import { describe, expect, it, vi } from 'vitest'

import { CatalogPickerSheet } from './catalog-picker-sheet.client'

type DemoItem = {
  id: string
  name: string
  tab: 'featured' | 'all'
  searchText: string
}

const items: DemoItem[] = [
  { id: 'alpha', name: 'Alpha Item', tab: 'featured', searchText: 'alpha lantern' },
  { id: 'beta', name: 'Beta Item', tab: 'all', searchText: 'beta rope' },
]

describe('CatalogPickerSheet', () => {
  it('filters rows by search query', async () => {
    const user = userEvent.setup()

    render(
      <CatalogPickerSheet
        open
        onOpenChange={vi.fn()}
        title="Catalog"
        items={items}
        getItemKey={(item) => item.id}
        getSearchText={(item) => item.searchText}
        renderItemHeader={(item) => <span>{item.name}</span>}
      />,
    )

    expect(screen.getByText('Alpha Item')).toBeInTheDocument()
    expect(screen.getByText('Beta Item')).toBeInTheDocument()

    await user.type(screen.getByRole('textbox', { name: 'Search catalog' }), 'rope')

    expect(screen.queryByText('Alpha Item')).not.toBeInTheDocument()
    expect(screen.getByText('Beta Item')).toBeInTheDocument()
  })

  it('renders tabs before the search input', () => {
    render(
      <CatalogPickerSheet
        open
        onOpenChange={vi.fn()}
        title="Catalog"
        items={items}
        getItemKey={(item) => item.id}
        getSearchText={(item) => item.searchText}
        getItemTab={(item) => item.tab}
        defaultTabId="featured"
        tabs={[
          { id: 'featured', label: 'Featured' },
          { id: 'all', label: 'All' },
        ]}
        renderItemHeader={(item) => <span>{item.name}</span>}
      />,
    )

    const tablist = screen.getByRole('tablist')
    const search = screen.getByRole('textbox', { name: 'Search catalog' })
    expect(tablist.compareDocumentPosition(search) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })

  it('resolves toolbar control render props with tab reset helpers', async () => {
    const user = userEvent.setup()

    render(
      <CatalogPickerSheet
        open
        onOpenChange={vi.fn()}
        title="Catalog"
        items={items}
        getItemKey={(item) => item.id}
        getSearchText={(item) => item.searchText}
        getItemTab={(item) => item.tab}
        defaultTabId="featured"
        tabs={[
          { id: 'featured', label: 'Featured' },
          { id: 'all', label: 'All' },
        ]}
        renderItemHeader={(item) => <span>{item.name}</span>}
        toolbarControls={({ searchQuery, clearSearchQuery, activeTabId, resetActiveTab }) => (
          <div>
            <span>Query: {searchQuery}</span>
            <span>Tab: {activeTabId}</span>
            <button type="button" onClick={clearSearchQuery}>
              Clear search
            </button>
            <button type="button" onClick={resetActiveTab}>
              Reset tab
            </button>
          </div>
        )}
      />,
    )

    await user.type(screen.getByRole('textbox', { name: 'Search catalog' }), 'rope')
    expect(screen.getByText('Query: rope')).toBeInTheDocument()

    await user.click(screen.getByRole('tab', { name: /All/i }))
    expect(screen.getByText('Tab: all')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Reset tab' }))
    expect(screen.getByText('Tab: featured')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Clear search' }))
    expect(screen.getByText('Query:')).toBeInTheDocument()
  })

  it('renders tab toolbar actions inline with tabs', () => {
    render(
      <CatalogPickerSheet
        open
        onOpenChange={vi.fn()}
        title="Catalog"
        items={items}
        getItemKey={(item) => item.id}
        getSearchText={(item) => item.searchText}
        getItemTab={(item) => item.tab}
        defaultTabId="featured"
        tabs={[
          { id: 'featured', label: 'Featured' },
          { id: 'all', label: 'All' },
        ]}
        renderItemHeader={(item) => <span>{item.name}</span>}
        tabToolbarActions={<button type="button">Reset view</button>}
      />,
    )

    const tablist = screen.getByRole('tablist')
    const resetButton = screen.getByRole('button', { name: 'Reset view' })
    expect(tablist.parentElement?.parentElement).toContainElement(resetButton)
  })

  it('preserves custom order from transformVisibleItems', () => {
    render(
      <CatalogPickerSheet
        open
        onOpenChange={vi.fn()}
        title="Catalog"
        items={items}
        getItemKey={(item) => item.id}
        getSearchText={(item) => item.searchText}
        renderItemHeader={(item) => <span>{item.name}</span>}
        transformVisibleItems={(visibleItems) => [...visibleItems].reverse()}
      />,
    )

    const rendered = screen.getAllByText(/Item$/).map((node) => node.textContent)
    expect(rendered).toEqual(['Beta Item', 'Alpha Item'])
  })

  it('switches tabs and expands collapsible details via leading caret', async () => {
    const user = userEvent.setup()

    render(
      <CatalogPickerSheet
        open
        onOpenChange={vi.fn()}
        title="Catalog"
        items={items}
        getItemKey={(item) => item.id}
        getSearchText={(item) => item.searchText}
        getItemToolbarLabel={(item) => item.name}
        getItemTab={(item) => item.tab}
        defaultTabId="featured"
        tabs={[
          { id: 'featured', label: 'Featured' },
          { id: 'all', label: 'All' },
        ]}
        renderItemHeader={(item) => <span>{item.name}</span>}
        renderItemDetails={(item) => <p>Details for {item.name}</p>}
      />,
    )

    expect(screen.getByText('Alpha Item')).toBeInTheDocument()
    expect(screen.queryByText('Beta Item')).not.toBeInTheDocument()

    await user.click(screen.getByRole('tab', { name: /All/i }))
    expect(screen.getByText('Beta Item')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Expand Beta Item' }))
    expect(screen.getByText('Details for Beta Item')).toBeVisible()
  })

  it('shows scoped empty copy when a tab has no rows without treating tabs as filters', () => {
    render(
      <CatalogPickerSheet
        open
        onOpenChange={vi.fn()}
        title="Catalog"
        items={[{ id: 'beta', name: 'Beta Item', tab: 'all', searchText: 'beta rope' }]}
        getItemKey={(item) => item.id}
        getSearchText={(item) => item.searchText}
        getItemTab={(item) => item.tab}
        defaultTabId="featured"
        tabs={[
          { id: 'featured', label: 'Featured' },
          { id: 'all', label: 'All' },
        ]}
        noScopedItemsMessage="No featured items."
        renderItemHeader={(item) => <span>{item.name}</span>}
      />,
    )

    expect(screen.getByRole('status')).toHaveTextContent('No featured items.')
  })

  it('shows no-results copy when structured filters are active', () => {
    const emptyItems: DemoItem[] = []

    render(
      <CatalogPickerSheet
        open
        onOpenChange={vi.fn()}
        title="Catalog"
        items={emptyItems}
        hasStructuredFilters
        getItemKey={(item) => item.id}
        getSearchText={(item) => item.searchText}
        renderItemHeader={(item) => <span>{item.name}</span>}
      />,
    )

    expect(screen.getByRole('status')).toHaveTextContent('No items match your search.')
  })

  it('has no axe accessibility violations', async () => {
    const { container } = render(
      <CatalogPickerSheet
        open
        onOpenChange={vi.fn()}
        title="Catalog"
        description="Pick an item."
        items={items}
        getItemKey={(item) => item.id}
        getSearchText={(item) => item.searchText}
        renderItemHeader={(item) => <span>{item.name}</span>}
      />,
    )

    await expectNoAxeViolations(container)
  })
})
