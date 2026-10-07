import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'
import { describe, expect, it, vi } from 'vitest'

import { CatalogFilterControls } from '../../filters/catalog-filter-controls.client'
import { FilterFieldCaption } from '../../filters/filter-field-caption.client'
import { createEqualsFilter, createTextFilter } from '../../filters/filter-engine.helpers'
import { createFilterSchema } from '../../filters/filter-schema.types'
import { CatalogToolbar } from './catalog-toolbar.client'
import {
  catalogToolbarUtilityBandVariants,
  catalogToolbarViewControlsVariants,
} from './catalog-toolbar.variants'

type DemoRow = { name: string; status: string }
type DemoFilterState = { search?: string; status?: string }

const densitySchema = createFilterSchema<DemoRow, DemoFilterState>([
  createTextFilter<DemoRow, DemoFilterState, 'search'>({
    id: 'search',
    label: 'Search',
    getSearchText: (row) => row.name,
  }),
  createEqualsFilter<DemoRow, DemoFilterState, 'status', 'draft' | 'published'>({
    id: 'status',
    label: 'Status',
    layout: 'inline',
    options: [
      { value: 'draft', label: 'Draft' },
      { value: 'published', label: 'Published' },
    ],
    getValue: (row) => row.status as 'draft' | 'published',
  }),
])

function TestSortControl() {
  return <FilterFieldCaption>Sort</FilterFieldCaption>
}

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

    const utility = screen.getByText('Controls').closest('[data-slot="catalog-toolbar-utility"]')
    const viewControls = screen
      .getByText('Sort')
      .closest('[data-slot="catalog-toolbar-view-controls"]')
    expect(utility).toContainElement(screen.getByText('Sort'))
    expect(viewControls).toContainElement(screen.getByRole('button', { name: 'Reset view' }))
    expect(viewControls).not.toContainElement(screen.getByText('Controls'))
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

  itAxe('has no axe accessibility violations', async () => {
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

  describe('utility band layout', () => {
    function expectContainerQueryBand() {
      const band = document.querySelector('[data-slot="catalog-toolbar-utility"]')
      expect(band).toHaveClass(...catalogToolbarUtilityBandVariants().split(' '))
      expect(catalogToolbarUtilityBandVariants()).toContain('flex-wrap')
      expect(catalogToolbarUtilityBandVariants()).not.toContain('flex-col')
      expect(band?.className).not.toMatch(/\bsm:/)
      expect(catalogToolbarViewControlsVariants()).toContain('items-end')
      expect(catalogToolbarViewControlsVariants()).toContain('gap-0.5')
      expect(catalogToolbarViewControlsVariants()).not.toMatch(/\bsm:/)
    }

    it('keeps primary filters, utility filters, and a sort/reset stack inside a narrow parent', () => {
      const { container } = render(
        <div style={{ width: 240 }}>
          <CatalogToolbar
            primaryControls={<span>Primary</span>}
            filterRow={{
              controls: <span>Utility filters</span>,
              actions: <span>Sort</span>,
            }}
            actions={<button type="button">Reset</button>}
          />
        </div>,
      )

      const primary = container.querySelector('[data-slot="catalog-toolbar-primary"]')
      const content = container.querySelector('[data-slot="catalog-toolbar-utility-content"]')
      const viewControls = container.querySelector('[data-slot="catalog-toolbar-view-controls"]')

      expect(primary).toHaveTextContent('Primary')
      expect(content).toHaveTextContent('Utility filters')
      expect(viewControls).toHaveTextContent('Sort')
      expect(viewControls).toContainElement(screen.getByRole('button', { name: 'Reset' }))
      expect(
        primary?.compareDocumentPosition(content as Node) & Node.DOCUMENT_POSITION_FOLLOWING,
      ).toBeTruthy()
      expect(
        content?.compareDocumentPosition(viewControls as Node) & Node.DOCUMENT_POSITION_FOLLOWING,
      ).toBeTruthy()
      expectContainerQueryBand()
    })

    it('omits the utility content region when only primary filters and sort are present', () => {
      const { container } = render(
        <div style={{ width: 240 }}>
          <CatalogToolbar
            primaryControls={<span>Primary</span>}
            filterRow={{ actions: <span>Sort</span> }}
          />
        </div>,
      )

      expect(container.querySelector('[data-slot="catalog-toolbar-primary"]')).toHaveTextContent(
        'Primary',
      )
      expect(container.querySelector('[data-slot="catalog-toolbar-utility-content"]')).toBeNull()
      expect(
        container.querySelector('[data-slot="catalog-toolbar-view-controls"]'),
      ).toHaveTextContent('Sort')
      expect(screen.queryByRole('button', { name: 'Reset' })).not.toBeInTheDocument()
      expectContainerQueryBand()
    })

    it('mounts reset beside utility filters only when the caller provides it', () => {
      const { rerender, container } = render(
        <CatalogToolbar
          filterRow={{ controls: <span>Utility filters</span> }}
          actions={<button type="button">Reset</button>}
        />,
      )

      expect(
        container.querySelector('[data-slot="catalog-toolbar-utility-content"]'),
      ).toHaveTextContent('Utility filters')
      expect(
        container.querySelector('[data-slot="catalog-toolbar-view-controls"]'),
      ).toContainElement(screen.getByRole('button', { name: 'Reset' }))
      expect(screen.queryByText('Sort')).not.toBeInTheDocument()

      rerender(<CatalogToolbar filterRow={{ controls: <span>Utility filters</span> }} />)

      expect(
        container.querySelector('[data-slot="catalog-toolbar-utility-content"]'),
      ).toHaveTextContent('Utility filters')
      expect(container.querySelector('[data-slot="catalog-toolbar-view-controls"]')).toBeNull()
    })

    it('renders sort alone when there are no utility filters and no reset', () => {
      const { container } = render(<CatalogToolbar filterRow={{ actions: <span>Sort</span> }} />)

      expect(container.querySelector('[data-slot="catalog-toolbar-utility-content"]')).toBeNull()
      expect(container.querySelector('[data-slot="catalog-toolbar-primary"]')).toBeNull()
      expect(
        container.querySelector('[data-slot="catalog-toolbar-view-controls"]'),
      ).toHaveTextContent('Sort')
      expect(screen.queryByRole('button')).not.toBeInTheDocument()
    })
  })

  it('applies compact density to search, filters, and sort under default toolbar', () => {
    render(
      <CatalogToolbar
        search={{ query: '', onQueryChange: vi.fn(), placeholder: 'Search catalog' }}
        primaryControls={
          <CatalogFilterControls
            schema={densitySchema}
            layout={{ primaryFieldIds: ['status'] }}
            state={{}}
            onValueChange={() => undefined}
          />
        }
        filterRow={{
          actions: <TestSortControl />,
        }}
      />,
    )

    expect(screen.getByRole('textbox', { name: 'Search catalog' })).toHaveClass('h-8')
    expect(screen.getByText('Status')).toHaveClass('text-xs')
    expect(screen.getByText('Sort')).toHaveClass('text-xs')
  })
})
