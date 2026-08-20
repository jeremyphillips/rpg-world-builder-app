import type { ReactNode } from 'react'

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'
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

  it('renders tabs before the search input by default', () => {
    render(
      <CatalogPickerSheet
        open
        onOpenChange={vi.fn()}
        title="Catalog"
        items={items}
        getItemKey={(item) => item.id}
        getSearchText={(item) => item.searchText}
        getItemTab={(item) => item.tab}
        recommendationsEnabled
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

  it('hides recommendation tabs when recommendationsEnabled is false', () => {
    render(
      <CatalogPickerSheet
        open
        onOpenChange={vi.fn()}
        title="Catalog"
        items={items}
        getItemKey={(item) => item.id}
        getSearchText={(item) => item.searchText}
        getItemTab={(item) => item.tab}
        recommendationsEnabled={false}
        defaultTabId="featured"
        tabs={[
          { id: 'featured', label: 'Featured' },
          { id: 'all', label: 'All' },
        ]}
        renderItemHeader={(item) => <span>{item.name}</span>}
      />,
    )

    expect(screen.queryByRole('tablist')).not.toBeInTheDocument()
  })

  it('renders tabs after search when recommendationTabsPosition is after-search', () => {
    render(
      <CatalogPickerSheet
        open
        onOpenChange={vi.fn()}
        title="Catalog"
        items={items}
        getItemKey={(item) => item.id}
        getSearchText={(item) => item.searchText}
        getItemTab={(item) => item.tab}
        recommendationsEnabled
        recommendationTabsPosition="after-search"
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
    expect(search.compareDocumentPosition(tablist) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })

  it('exposes sheet reset helpers through the actions render prop', async () => {
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
        recommendationsEnabled
        defaultTabId="featured"
        tabs={[
          { id: 'featured', label: 'Featured' },
          { id: 'all', label: 'All' },
        ]}
        renderItemHeader={(item) => <span>{item.name}</span>}
        actions={({ searchQuery, resetSearchQuery, activeTabId, resetActiveTab }) => (
          <div>
            <span>Query: {searchQuery}</span>
            <span>Tab: {activeTabId}</span>
            <button type="button" onClick={resetSearchQuery}>
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

  it('renders actions inline with tabs when recommendations are enabled', () => {
    render(
      <CatalogPickerSheet
        open
        onOpenChange={vi.fn()}
        title="Catalog"
        items={items}
        getItemKey={(item) => item.id}
        getSearchText={(item) => item.searchText}
        getItemTab={(item) => item.tab}
        recommendationsEnabled
        defaultTabId="featured"
        tabs={[
          { id: 'featured', label: 'Featured' },
          { id: 'all', label: 'All' },
        ]}
        renderItemHeader={(item) => <span>{item.name}</span>}
        actions={<button type="button">Reset view</button>}
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
        recommendationsEnabled
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
        recommendationsEnabled
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

  it('supports exclusive controlled row expansion', async () => {
    const user = userEvent.setup()
    const onExpandedItemChange = vi.fn()

    const { rerender } = render(
      <CatalogPickerSheet
        open
        onOpenChange={vi.fn()}
        title="Catalog"
        items={items}
        getItemKey={(item) => item.id}
        getSearchText={(item) => item.searchText}
        expandedItemId="alpha"
        onExpandedItemChange={onExpandedItemChange}
        renderItemHeader={(item) => <span>{item.name}</span>}
        renderItemDetails={(item) => <p>{item.name} details</p>}
      />,
    )

    expect(screen.getByText('Alpha Item details').parentElement).not.toHaveAttribute('hidden')
    expect(screen.getByText('Beta Item details').parentElement).toHaveAttribute('hidden')

    await user.click(screen.getByRole('button', { name: 'Expand beta' }))
    expect(onExpandedItemChange).toHaveBeenCalledWith('beta')

    rerender(
      <CatalogPickerSheet
        open
        onOpenChange={vi.fn()}
        title="Catalog"
        items={items}
        getItemKey={(item) => item.id}
        getSearchText={(item) => item.searchText}
        expandedItemId="beta"
        onExpandedItemChange={onExpandedItemChange}
        renderItemHeader={(item) => <span>{item.name}</span>}
        renderItemDetails={(item) => <p>{item.name} details</p>}
      />,
    )

    expect(screen.getByText('Alpha Item details').parentElement).toHaveAttribute('hidden')
    expect(screen.getByText('Beta Item details').parentElement).not.toHaveAttribute('hidden')
  })

  itAxe('has no axe accessibility violations', async () => {
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

  it('replaces the picker body with bodyReplacement and preserves search state on return', async () => {
    const user = userEvent.setup()

    function sheetProps(bodyReplacement?: ReactNode) {
      return {
        open: true,
        onOpenChange: vi.fn(),
        title: 'Catalog',
        items,
        getItemKey: (item: DemoItem) => item.id,
        getSearchText: (item: DemoItem) => item.searchText,
        renderItemHeader: (item: DemoItem) => <span>{item.name}</span>,
        bodyReplacement,
      }
    }

    const { rerender } = render(<CatalogPickerSheet {...sheetProps()} />)
    await user.type(screen.getByRole('textbox', { name: 'Search catalog' }), 'rope')
    expect(screen.queryByText('Alpha Item')).not.toBeInTheDocument()

    rerender(<CatalogPickerSheet {...sheetProps(<p>Inline create flow</p>)} />)
    expect(screen.getByText('Inline create flow')).toBeInTheDocument()
    expect(screen.queryByRole('textbox', { name: 'Search catalog' })).not.toBeInTheDocument()
    expect(screen.queryByText('Beta Item')).not.toBeInTheDocument()

    rerender(<CatalogPickerSheet {...sheetProps()} />)
    expect(screen.getByRole('textbox', { name: 'Search catalog' })).toHaveValue('rope')
    expect(screen.getByText('Beta Item')).toBeInTheDocument()
    expect(screen.queryByText('Alpha Item')).not.toBeInTheDocument()
  })

  it('drops catalog content inset when rowLayout is entity-card', () => {
    render(
      <CatalogPickerSheet
        open
        onOpenChange={vi.fn()}
        title="Catalog"
        rowPreset="catalog"
        rowLayout="entity-card"
        items={items}
        getItemKey={(item) => item.id}
        getSearchText={(item) => item.searchText}
        renderItemHeader={(item) => <span>{item.name}</span>}
      />,
    )

    const rowShell = screen.getAllByRole('group')[0]
    expect(rowShell).toHaveClass('p-0')
    expect(rowShell).not.toHaveClass('pl-2')
  })

  it('delegates row rendering to renderCollapsibleRow when provided', () => {
    render(
      <CatalogPickerSheet
        open
        onOpenChange={vi.fn()}
        title="Catalog"
        items={items}
        getItemKey={(item) => item.id}
        getSearchText={(item) => item.searchText}
        renderItemDetails={(item) => <p>{item.name} details</p>}
        renderCollapsibleRow={(args) => (
          <div data-testid="custom-row">
            <span>{args.item.name}</span>
            <span data-testid="collapsible">{String(args.collapsible)}</span>
            {args.details}
          </div>
        )}
      />,
    )

    expect(screen.getAllByTestId('custom-row')).toHaveLength(items.length)
    expect(screen.getAllByTestId('collapsible')[0]).toHaveTextContent('true')
    expect(screen.queryByRole('group')).not.toBeInTheDocument()
  })

  it('does not reduce toolbar bottom padding when auxiliaryAction is absent', () => {
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

    const toolbar = screen.getByRole('textbox', { name: 'Search catalog' }).closest('.space-y-4')
    expect(toolbar).toHaveClass('pb-4')
    expect(toolbar).not.toHaveClass('pb-0')
  })

  it('reduces toolbar bottom padding when auxiliaryAction is present', () => {
    render(
      <CatalogPickerSheet
        open
        onOpenChange={vi.fn()}
        title="Catalog"
        items={items}
        getItemKey={(item) => item.id}
        getSearchText={(item) => item.searchText}
        renderItemHeader={(item) => <span>{item.name}</span>}
        auxiliaryAction={{
          state: 'action',
          label: 'Create item',
          onAction: vi.fn(),
        }}
      />,
    )

    const toolbar = screen.getByRole('textbox', { name: 'Search catalog' }).closest('.space-y-4')
    expect(toolbar).toHaveClass('pb-0')
    expect(toolbar).not.toHaveClass('pb-4')
  })

  it('renders auxiliaryAction after search and before results', () => {
    render(
      <CatalogPickerSheet
        open
        onOpenChange={vi.fn()}
        title="Catalog"
        items={items}
        getItemKey={(item) => item.id}
        getSearchText={(item) => item.searchText}
        renderItemHeader={(item) => <span>{item.name}</span>}
        auxiliaryAction={{
          state: 'action',
          label: 'Create item',
          onAction: vi.fn(),
        }}
      />,
    )

    const search = screen.getByRole('textbox', { name: 'Search catalog' })
    const action = screen.getByRole('button', { name: 'Create item' })
    const result = screen.getByText('Alpha Item')

    expect(search.compareDocumentPosition(action) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(action.compareDocumentPosition(result) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })

  it('keeps auxiliaryAction outside the scrollable body', () => {
    render(
      <CatalogPickerSheet
        open
        onOpenChange={vi.fn()}
        title="Catalog"
        items={items}
        getItemKey={(item) => item.id}
        getSearchText={(item) => item.searchText}
        renderItemHeader={(item) => <span>{item.name}</span>}
        auxiliaryAction={{
          state: 'action',
          label: 'Create item',
          onAction: vi.fn(),
        }}
      />,
    )

    const action = screen.getByRole('button', { name: 'Create item' })
    const result = screen.getByText('Alpha Item')
    const scrollBody = result.closest('.overflow-y-auto')

    expect(scrollBody).toBeTruthy()
    expect(scrollBody).not.toContainElement(action)
  })

  it('invokes auxiliaryAction onAction when clicked', async () => {
    const user = userEvent.setup()
    const onAction = vi.fn()

    render(
      <CatalogPickerSheet
        open
        onOpenChange={vi.fn()}
        title="Catalog"
        items={items}
        getItemKey={(item) => item.id}
        getSearchText={(item) => item.searchText}
        renderItemHeader={(item) => <span>{item.name}</span>}
        auxiliaryAction={{
          state: 'action',
          label: 'Create item',
          onAction,
        }}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Create item' }))
    expect(onAction).toHaveBeenCalledTimes(1)
  })

  it('keeps auxiliaryAction visible when results are empty or filtered out', async () => {
    const user = userEvent.setup()

    const { rerender } = render(
      <CatalogPickerSheet
        open
        onOpenChange={vi.fn()}
        title="Catalog"
        items={[] as DemoItem[]}
        getItemKey={(item) => item.id}
        getSearchText={(item) => item.searchText}
        renderItemHeader={(item) => <span>{item.name}</span>}
        noItemsMessage="No items available."
        auxiliaryAction={{
          state: 'action',
          label: 'Create item',
          onAction: vi.fn(),
        }}
      />,
    )

    expect(screen.getByRole('button', { name: 'Create item' })).toBeInTheDocument()
    expect(screen.getByText('No items available.')).toBeInTheDocument()

    rerender(
      <CatalogPickerSheet
        open
        onOpenChange={vi.fn()}
        title="Catalog"
        items={items}
        getItemKey={(item) => item.id}
        getSearchText={(item) => item.searchText}
        renderItemHeader={(item) => <span>{item.name}</span>}
        auxiliaryAction={{
          state: 'action',
          label: 'Create item',
          onAction: vi.fn(),
        }}
      />,
    )

    await user.type(screen.getByRole('textbox', { name: 'Search catalog' }), 'zzz')
    expect(screen.getByRole('button', { name: 'Create item' })).toBeInTheDocument()
    expect(screen.getByText('No items match your search.')).toBeInTheDocument()
  })

  it('renders menu auxiliaryAction and invokes item handlers', async () => {
    const user = userEvent.setup()
    const onFortification = vi.fn()

    render(
      <CatalogPickerSheet
        open
        onOpenChange={vi.fn()}
        title="Catalog"
        items={items}
        getItemKey={(item) => item.id}
        getSearchText={(item) => item.searchText}
        renderItemHeader={(item) => <span>{item.name}</span>}
        auxiliaryAction={{
          state: 'menu',
          label: 'Create new',
          items: [
            { label: 'Building', onAction: vi.fn() },
            { label: 'Fortification', onAction: onFortification },
          ],
        }}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Create new' }))
    await user.click(screen.getByRole('menuitem', { name: 'Fortification' }))

    expect(onFortification).toHaveBeenCalledOnce()
  })

  it('renders unavailable auxiliaryAction as hint text instead of a button', () => {
    render(
      <CatalogPickerSheet
        open
        onOpenChange={vi.fn()}
        title="Catalog"
        items={items}
        getItemKey={(item) => item.id}
        getSearchText={(item) => item.searchText}
        renderItemHeader={(item) => <span>{item.name}</span>}
        auxiliaryAction={{
          state: 'unavailable',
          message: 'Creation is unavailable.',
        }}
      />,
    )

    expect(
      screen.queryByRole('button', { name: 'Creation is unavailable.' }),
    ).not.toBeInTheDocument()
    expect(screen.getByText('Creation is unavailable.')).toBeInTheDocument()
  })

  it('orders toolbar, auxiliaryAction, scroll body, and footer in the DOM', () => {
    render(
      <CatalogPickerSheet
        open
        onOpenChange={vi.fn()}
        title="Catalog"
        items={items}
        getItemKey={(item) => item.id}
        getSearchText={(item) => item.searchText}
        renderItemHeader={(item) => <span>{item.name}</span>}
        auxiliaryAction={{
          state: 'action',
          label: 'Create item',
          onAction: vi.fn(),
        }}
        footer={<button type="button">Submit</button>}
      />,
    )

    const search = screen.getByRole('textbox', { name: 'Search catalog' })
    const action = screen.getByRole('button', { name: 'Create item' })
    const result = screen.getByText('Alpha Item')
    const footer = screen.getByRole('button', { name: 'Submit' })

    expect(search.compareDocumentPosition(action) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(action.compareDocumentPosition(result) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(result.compareDocumentPosition(footer) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })
})
