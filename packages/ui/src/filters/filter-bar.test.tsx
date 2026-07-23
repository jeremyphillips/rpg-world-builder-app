import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expectNoAxeViolations } from '@rpg/ui/test-utils'
import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'

import { createBooleanFilter, createEqualsFilter, createTextFilter } from './filter-engine.helpers'
import { createFilterSchema } from './filter-schema.types'
import { FilterAdvancedPanel } from './filter-advanced-panel.client'
import { FilterBar } from './filter-bar.client'

type DemoRow = {
  name: string
  status: string
  hidden?: boolean
}

type TestFilterState = {
  search?: string
  status?: 'draft' | 'published'
  hiddenOnly?: boolean
}

const schema = createFilterSchema<DemoRow, TestFilterState>([
  createTextFilter<DemoRow, TestFilterState, 'search'>({
    id: 'search',
    label: 'Search',
    placeholder: 'Search…',
    getSearchText: (row) => row.name,
  }),
  createEqualsFilter<DemoRow, TestFilterState, 'status', 'draft' | 'published'>({
    id: 'status',
    label: 'Status',
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
    getValue: (row) => row.hidden === true,
  }),
])

function FilterSystemHarness({
  initialState = {},
  onReset = vi.fn(),
}: {
  initialState?: TestFilterState
  onReset?: () => void
}) {
  const [state, setState] = useState<TestFilterState>(initialState)
  const [advancedOpen, setAdvancedOpen] = useState(false)

  return (
    <>
      <FilterBar
        schema={schema}
        state={state}
        advancedOpen={advancedOpen}
        onAdvancedOpenChange={setAdvancedOpen}
        onValueChange={(id, value) => {
          setState((current) => ({ ...current, [id]: value }))
        }}
        onReset={() => {
          setState({})
          onReset()
        }}
      />
      <FilterAdvancedPanel
        schema={schema}
        state={state}
        open={advancedOpen}
        onValueChange={(id, value) => {
          setState((current) => ({ ...current, [id]: value }))
        }}
        onClearAll={() => {
          setState({})
          onReset()
        }}
      />
    </>
  )
}

describe('FilterBar', () => {
  it('renders primary filters and opens the advanced panel', async () => {
    const user = userEvent.setup()

    render(<FilterSystemHarness />)

    expect(screen.getByLabelText('Search')).toBeInTheDocument()
    expect(screen.queryByLabelText('Hidden only')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /^Filters/ }))
    expect(screen.getByLabelText('Hidden only')).toBeInTheDocument()
  })

  it('shows clear actions when filters are modified', async () => {
    const user = userEvent.setup()
    const onReset = vi.fn()

    render(<FilterSystemHarness initialState={{ search: 'fire' }} onReset={onReset} />)

    expect(screen.getByRole('button', { name: 'Clear filters' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /^Filters/ }))
    await user.click(screen.getByRole('button', { name: 'Clear all filters' }))
    expect(onReset).toHaveBeenCalled()
  })

  it('shows an advanced modified count badge when collapsed', () => {
    render(<FilterSystemHarness initialState={{ hiddenOnly: true }} />)

    expect(screen.getByText('1')).toBeInTheDocument()
  })

  it('calls onReset from the toolbar button', () => {
    const onReset = vi.fn()

    render(<FilterSystemHarness initialState={{ search: 'spell' }} onReset={onReset} />)

    fireEvent.click(screen.getByRole('button', { name: 'Clear filters' }))
    expect(onReset).toHaveBeenCalledTimes(1)
  })

  it('has no axe accessibility violations', async () => {
    const { container } = render(<FilterSystemHarness initialState={{ search: 'fire', status: 'draft' }} />)

    await expectNoAxeViolations(container)
  })
})
