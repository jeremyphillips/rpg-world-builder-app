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

  it('keeps legacy rows expandable via the right-side details button', async () => {
    const user = userEvent.setup()

    render(
      <CatalogPickerSheet
        open
        onOpenChange={vi.fn()}
        title="Catalog"
        items={items}
        getItemKey={(item) => item.id}
        getSearchText={(item) => item.searchText}
        renderItem={(item) => <span>{item.name}</span>}
        renderItemDetails={(item) => <p>Details for {item.name}</p>}
      />,
    )

    const [alphaDetailsButton] = screen.getAllByRole('button', { name: 'Show details' })
    await user.click(alphaDetailsButton!)
    expect(screen.getByText('Details for Alpha Item')).toBeInTheDocument()
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
