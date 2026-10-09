import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { beforeAll, describe, expect, it } from 'vitest'

import {
  createBooleanFilter,
  createChipsFilter,
  createEqualsFilter,
  createPopoverFilter,
  createTextFilter,
} from './filter-engine.helpers'
import { createFilterSchema } from './filter-schema.types'
import { SELECT_SIZING_LABEL_DATA_ATTR } from '../components/ui/select-trigger.lib'
import { FilterChromeProvider } from './filter-chrome.context'
import { FilterFieldRenderer } from './filter-field-renderer.client'
import type { FilterRenderContext } from './filter-field-renderer.client'
import { FILTER_TOOLBAR_SIZER_LABEL_ATTR } from './filter-toolbar-label-sizer.client'

type DemoRow = { name: string; status: string }
type TestFilterState = {
  search?: string
  status?: 'draft' | 'published'
  hiddenOnly?: boolean
  levels?: number[]
  mechanics?: Record<string, string[]>
  activeMechanics?: Record<string, string[]>
  noAllStatus?: 'draft' | 'published'
  school?: string
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
    allOptionLabel: 'All statuses',
  }),
  createBooleanFilter<DemoRow, TestFilterState, 'hiddenOnly'>({
    id: 'hiddenOnly',
    label: 'Hidden only',
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
  createEqualsFilter<DemoRow, TestFilterState, 'school', string>({
    id: 'school',
    label: 'School',
    layout: 'inline',
    ariaLabel: 'Filter by school',
    showAllOption: false,
    options: [{ value: 'all', label: 'All' }],
    getValue: () => 'all',
  }),
  createPopoverFilter<DemoRow, TestFilterState, 'mechanics'>({
    id: 'mechanics',
    label: 'Mechanics',
    triggerLabel: (count) => `Mechanics (${count})`,
    groups: () => [],
    matches: () => true,
  }),
  createPopoverFilter<DemoRow, TestFilterState, 'activeMechanics'>({
    id: 'activeMechanics',
    label: 'Casting',
    triggerLabel: (count) => (count === 0 ? 'Casting' : `Casting · ${count}`),
    groups: () => [
      {
        id: 'traits',
        label: 'Traits',
        options: [
          { value: 'concentration', label: 'Concentration' },
          { value: 'ritual', label: 'Ritual' },
        ],
      },
    ],
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
    const caption = screen.getByText('Status')
    expect(caption.tagName).toBe('LABEL')
    expect(caption).toHaveAttribute('for', 'test-status')
    expect(caption).toHaveClass('text-xs', 'text-muted-foreground')
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

  it('sizes inline selects to their content', () => {
    render(<RendererHarness fieldId="school" />)

    const group = screen.getByRole('group', { name: 'Filter by school' })
    expect(group).toHaveClass('w-fit')
    expect(group).not.toHaveClass('w-full')
    expect(screen.getByRole('combobox', { name: 'School' })).toHaveClass('w-auto')
  })

  it('reserves every select option label in the width sizer', () => {
    render(<RendererHarness fieldId="status" />)

    const trigger = screen.getByRole('combobox', { name: 'Status' })
    const ghosts = [...trigger.querySelectorAll(`[${SELECT_SIZING_LABEL_DATA_ATTR}]`)].map(
      (node) => node.textContent,
    )
    expect(ghosts).toEqual(['All statuses', 'Draft', 'Published'])
    expect(trigger).toHaveAttribute('title', 'All statuses')
  })

  it('caps inline selects at lg when no width token is set', () => {
    render(<RendererHarness fieldId="school" />)
    expect(screen.getByRole('combobox', { name: 'School' })).toHaveClass('max-w-48')
  })

  it('reserves the popover trigger extremes in the width sizer', () => {
    render(<RendererHarness fieldId="activeMechanics" />)

    const trigger = screen.getByRole('button', { name: 'Casting' })
    const ghosts = [...trigger.querySelectorAll(`[${FILTER_TOOLBAR_SIZER_LABEL_ATTR}]`)].map(
      (node) => node.textContent,
    )
    expect(ghosts).toEqual(['Casting', 'Casting · 2'])
    expect(trigger).toHaveTextContent('Casting')
  })

  it('renders catalog chips with compact label sizing under default chrome', () => {
    render(<RendererHarness fieldId="levels" />)
    expect(screen.getByText('Levels')).toHaveClass('text-xs', 'text-muted-foreground')
  })
})

describe('FilterFieldRenderer behavior', () => {
  it('renders a custom label for the all option', async () => {
    const user = userEvent.setup()
    render(<RendererHarness fieldId="status" />)

    await user.click(screen.getByRole('combobox', { name: 'Status' }))
    expect(screen.getByRole('option', { name: 'All statuses' })).toBeInTheDocument()
  })

  it('renders a disabled popover trigger when groups are empty', () => {
    render(<RendererHarness fieldId="mechanics" />)

    const trigger = screen.getByRole('button', { name: 'Mechanics' })
    expect(trigger).toBeDisabled()
    expect(trigger).toHaveAttribute('aria-disabled', 'true')
    expect(trigger).toHaveTextContent('Mechanics (no options)')
  })

  it('clears text filters to undefined', async () => {
    const user = userEvent.setup()
    render(<RendererHarness fieldId="search" initialState={{ search: 'fire' }} />)

    const input = screen.getByLabelText('Search')
    await user.clear(input)

    expect(input).toHaveValue('')
  })

  it('renders SearchBar when text filter control is search', () => {
    const schema = createFilterSchema<{ name: string }, { name?: string }>([
      createTextFilter<{ name: string }, { name?: string }, 'name'>({
        id: 'name',
        label: 'Name',
        control: 'search',
        placeholder: 'Search…',
        getSearchText: (row) => row.name,
      }),
    ])
    const field = schema.fields[0]!
    render(
      <FilterChromeProvider>
        <FilterFieldRenderer
          field={field}
          controlId="name-search"
          context={{
            schema,
            state: { name: 'rope' },
            idPrefix: 'overview',
            onValueChange: () => undefined,
          }}
        />
      </FilterChromeProvider>,
    )

    expect(screen.getByRole('searchbox', { name: 'Name' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Clear search' })).toBeInTheDocument()
  })

  it('omits the All option when showAllOption is false', async () => {
    const user = userEvent.setup()
    render(<RendererHarness fieldId="noAllStatus" initialState={{ noAllStatus: 'draft' }} />)

    await user.click(screen.getByRole('combobox', { name: 'No-all status' }))
    expect(screen.queryByText('All No-all status')).not.toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Draft' })).toBeInTheDocument()
  })
})

describe('floating filter layout', () => {
  it('uses the label as the text field name and skips the default placeholder', () => {
    const schema = createFilterSchema<{ name: string }, { name?: string }>([
      createTextFilter<{ name: string }, { name?: string }, 'name'>({
        id: 'name',
        label: 'Name',
        layout: 'floating',
        placeholder: 'Search by name…',
        getSearchText: (row) => row.name,
      }),
    ])
    const field = schema.fields[0]!
    render(
      <FilterChromeProvider>
        <FilterFieldRenderer
          field={field}
          controlId="floating-name"
          context={{
            schema,
            state: {},
            idPrefix: 'floating',
            onValueChange: () => undefined,
          }}
        />
      </FilterChromeProvider>,
    )

    const input = screen.getByRole('textbox', { name: 'Name' })
    expect(input).not.toHaveAttribute('aria-label')
    expect(input).toHaveAttribute('placeholder', 'Search by name…')
    expect(input).toHaveAttribute('autocomplete', 'off')
  })

  it('elides the all trigger and keeps the menu label', async () => {
    const user = userEvent.setup()
    const schema = createFilterSchema<{ domain: string }, { domain?: string }>([
      createEqualsFilter<{ domain: string }, { domain?: string }, 'domain', string>({
        id: 'domain',
        label: 'Domain',
        layout: 'floating',
        allOptionLabel: 'All domains',
        options: [{ value: 'arcane', label: 'Arcane' }],
        getValue: (row) => row.domain,
      }),
    ])
    const field = schema.fields[0]!
    render(
      <FilterChromeProvider>
        <FilterFieldRenderer
          field={field}
          controlId="floating-domain"
          context={{
            schema,
            state: {},
            idPrefix: 'floating',
            onValueChange: () => undefined,
          }}
        />
      </FilterChromeProvider>,
    )

    const trigger = screen.getByRole('combobox', { name: 'Domain' })
    expect(trigger).toHaveTextContent('All')
    expect(screen.queryByRole('group')).not.toBeInTheDocument()
    const ghosts = [...trigger.querySelectorAll(`[${SELECT_SIZING_LABEL_DATA_ATTR}]`)].map(
      (node) => node.textContent,
    )
    expect(ghosts).toEqual(['All', 'Arcane', 'Domain'])

    await user.click(trigger)
    expect(screen.getByRole('option', { name: 'All domains' })).toBeInTheDocument()
  })
})
