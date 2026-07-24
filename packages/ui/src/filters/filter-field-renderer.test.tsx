import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { beforeAll, describe, expect, it } from 'vitest'

import { CatalogFilterChips } from '../components/ui/catalog-filter-chips.client'
import {
  createBooleanFilter,
  createChipsFilter,
  createEqualsFilter,
  createPopoverFilter,
  createTextFilter,
} from './filter-engine.helpers'
import { createFilterSchema } from './filter-schema.types'
import { FilterChromeProvider } from './filter-chrome.context'
import { FilterFieldRenderer } from './filter-field-renderer.client'
import type { FilterRenderContext } from './filter-field-renderer.client'

type DemoRow = { name: string; status: string }
type TestFilterState = {
  search?: string
  status?: 'draft' | 'published'
  hiddenOnly?: boolean
  levels?: number[]
  mechanics?: Record<string, string[]>
  noAllStatus?: 'draft' | 'published'
}

const schema = createFilterSchema<DemoRow, TestFilterState>([
  createTextFilter<DemoRow, TestFilterState, 'search'>({
    id: 'search',
    label: 'Search',
    getSearchText: (row) => row.name,
  }),
  createEqualsFilter<DemoRow, TestFilterState, 'status', 'draft' | 'published'>({
    id: 'status',
    label: 'Status',
    placement: 'advanced',
    layout: 'stacked',
    width: 'md',
    options: [
      { value: 'draft', label: 'Draft' },
      { value: 'published', label: 'Published' },
    ],
    getValue: (row) => row.status as 'draft' | 'published',
    showAllOption: true,
  }),
  createBooleanFilter<DemoRow, TestFilterState, 'hiddenOnly'>({
    id: 'hiddenOnly',
    label: 'Hidden only',
    hiddenCount: () => 3,
    getValue: () => false,
  }),
  createChipsFilter<DemoRow, TestFilterState, 'levels'>({
    id: 'levels',
    label: 'Levels',
    selectionMode: 'multiple',
    options: [
      { value: '__all__', label: 'All' },
      { value: '1', label: '1st' },
    ],
    matches: () => true,
  }),
  createEqualsFilter<DemoRow, TestFilterState, 'noAllStatus', 'draft' | 'published'>({
    id: 'noAllStatus',
    label: 'No-all status',
    showAllOption: false,
    options: [
      { value: 'draft', label: 'Draft' },
      { value: 'published', label: 'Published' },
    ],
    getValue: (row) => row.status as 'draft' | 'published',
  }),
  createPopoverFilter<DemoRow, TestFilterState, 'mechanics'>({
    id: 'mechanics',
    label: 'Mechanics',
    triggerLabel: (count) => `Mechanics (${count})`,
    groups: () => [],
    matches: () => true,
  }),
])

beforeAll(() => {
  if (!HTMLElement.prototype.hasPointerCapture) {
    HTMLElement.prototype.hasPointerCapture = () => false
  }
  if (!HTMLElement.prototype.releasePointerCapture) {
    HTMLElement.prototype.releasePointerCapture = () => undefined
  }
  if (!Element.prototype.scrollIntoView) {
    Element.prototype.scrollIntoView = () => undefined
  }
})

function RendererHarness({
  fieldId,
  density,
  initialState = {},
}: {
  fieldId: keyof TestFilterState
  density?: 'compact' | 'comfortable'
  initialState?: TestFilterState
}) {
  const [state, setState] = useState<TestFilterState>(initialState)
  const field = schema.fields.find((entry) => entry.id === fieldId)
  if (!field) return null

  const context: FilterRenderContext<DemoRow, TestFilterState> = {
    schema,
    state,
    idPrefix: 'test',
    onValueChange: (id, value) => {
      setState((current) => ({ ...current, [id]: value }))
    },
  }

  return (
    <FilterChromeProvider density={density}>
      <FilterFieldRenderer field={field} controlId={`test-${fieldId}`} context={context} />
    </FilterChromeProvider>
  )
}

describe('FilterFieldRenderer chrome', () => {
  it('uses compact label sizing by default for stacked select', () => {
    render(<RendererHarness fieldId="status" />)
    expect(screen.getByText('Status')).toHaveClass('text-xs')
  })

  it('applies comfortable density override to select labels', () => {
    render(<RendererHarness fieldId="status" density="comfortable" />)
    expect(screen.getByText('Status')).toHaveClass('text-sm')
  })

  it('inherits nested provider density when child omits override', () => {
    render(
      <FilterChromeProvider density="comfortable">
        <RendererHarness fieldId="status" />
      </FilterChromeProvider>,
    )
    expect(screen.getByText('Status')).toHaveClass('text-sm')
  })

  it('renders catalog chips with compact label sizing under default chrome', () => {
    render(<RendererHarness fieldId="levels" />)
    expect(screen.getByText('Levels')).toHaveClass('text-xs')
  })
})

describe('FilterFieldRenderer behavior', () => {
  it('renders a disabled popover trigger when groups are empty', () => {
    render(<RendererHarness fieldId="mechanics" />)

    const trigger = screen.getByRole('button', { name: 'Mechanics' })
    expect(trigger).toBeDisabled()
    expect(trigger).toHaveAttribute('aria-disabled', 'true')
    expect(trigger).toHaveTextContent('Mechanics (no options)')
  })

  it('shows hiddenCount suffix for checked boolean fields', () => {
    render(<RendererHarness fieldId="hiddenOnly" initialState={{ hiddenOnly: true }} />)

    expect(screen.getByText('3 hidden')).toBeInTheDocument()
  })

  it('clears text filters to undefined', async () => {
    const user = userEvent.setup()
    render(<RendererHarness fieldId="search" initialState={{ search: 'fire' }} />)

    const input = screen.getByLabelText('Search')
    await user.clear(input)

    expect(input).toHaveValue('')
  })

  it('omits the All option when showAllOption is false', async () => {
    const user = userEvent.setup()
    render(<RendererHarness fieldId="noAllStatus" initialState={{ noAllStatus: 'draft' }} />)

    await user.click(screen.getByRole('combobox', { name: 'No-all status' }))
    expect(screen.queryByText('All No-all status')).not.toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Draft' })).toBeInTheDocument()
  })
})

describe('CatalogFilterChips standalone fallback', () => {
  it('defaults to md label sizing without provider', () => {
    render(
      <CatalogFilterChips
        id="standalone"
        label="School"
        selectionMode="single-required"
        value="all"
        options={[{ value: 'all', label: 'All' }]}
        onValueChange={() => {}}
      />,
    )

    expect(screen.getByText('School')).toHaveClass('text-sm')
  })

  it('prefers explicit labelClassName over presentation and context', () => {
    render(
      <FilterChromeProvider density="compact">
        <CatalogFilterChips
          id="explicit"
          label="School"
          labelClassName="text-lg"
          presentation={{
            type: 'chips',
            labelClassName: 'text-xs',
            groupClassName: '',
            chipSize: 'sm',
            shellClassName: 'gap-1',
          }}
          selectionMode="single-required"
          value="all"
          options={[{ value: 'all', label: 'All' }]}
          onValueChange={() => {}}
        />
      </FilterChromeProvider>,
    )

    expect(screen.getByText('School')).toHaveClass('text-lg')
  })

  it('uses presentation labelClassName when explicit labelClassName is omitted', () => {
    render(
      <CatalogFilterChips
        id="presentation"
        label="School"
        presentation={{
          type: 'chips',
          labelClassName: 'text-xs text-muted-foreground',
          groupClassName: '',
          chipSize: 'sm',
          shellClassName: 'gap-1',
        }}
        selectionMode="single-required"
        value="all"
        options={[{ value: 'all', label: 'All' }]}
        onValueChange={() => {}}
      />,
    )

    expect(screen.getByText('School')).toHaveClass('text-xs')
  })
})
