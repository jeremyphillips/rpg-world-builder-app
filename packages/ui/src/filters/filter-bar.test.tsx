/**
 * @vitest-environment jsdom
 */
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'
import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'

import { DataTableFilterRegion } from '../components/ui/data-table-filter-region.client'
import { createBooleanFilter, createEqualsFilter, createTextFilter } from './filter-engine.helpers'
import { resetFilterState, setFilterValue } from './filter-engine'
import { useFilterState } from './use-filter-state.client'
import { createFilterSchema } from './filter-schema.types'
import { FilterBar } from './filter-bar.client'
import { FilterFieldList } from './filter-fields.client'
import { countModifiedFilters } from './filter-engine'

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
    getValue: (row) => row.hidden === true,
  }),
])

type MixedPrimaryState = {
  search?: string
  hitDie?: string
  spellcasting?: boolean
}

const mixedPrimarySchema = createFilterSchema<DemoRow, MixedPrimaryState>([
  createTextFilter<DemoRow, MixedPrimaryState, 'search'>({
    id: 'search',
    label: 'Search',
    placeholder: 'Search…',
    getSearchText: (row) => row.name,
  }),
  createEqualsFilter<DemoRow, MixedPrimaryState, 'hitDie', string>({
    id: 'hitDie',
    label: 'Hit Die',
    layout: 'stacked',
    width: 'md',
    options: [
      { value: '6', label: 'd6' },
      { value: '8', label: 'd8' },
    ],
    getValue: () => '8',
  }),
  createBooleanFilter<DemoRow, MixedPrimaryState, 'spellcasting'>({
    id: 'spellcasting',
    label: 'Has Spellcasting',
    placement: 'primary',
    getValue: () => false,
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
  const advancedFields = schema.fields.filter((field) => field.placement === 'advanced')
  const advancedModifiedCount = countModifiedFilters(schema, state, 'advanced')

  return (
    <DataTableFilterRegion
      primaryFilters={
        <FilterBar
          schema={schema}
          state={state}
          onValueChange={(id, value) => {
            setState((current) => setFilterValue(schema, current, id, value))
          }}
          onReset={() => {
            setState(resetFilterState(schema))
            onReset()
          }}
        />
      }
      additionalFilterFields={
        <FilterFieldList
          schema={schema}
          fields={advancedFields}
          state={state}
          idPrefix="filters-advanced"
          onValueChange={(id, value) => {
            setState((current) => setFilterValue(schema, current, id, value))
          }}
        />
      }
      additionalFiltersOpen={advancedOpen}
      onAdditionalFiltersOpenChange={setAdvancedOpen}
      activeAdditionalFilterCount={advancedModifiedCount}
    />
  )
}

describe('FilterBar', () => {
  it('renders primary filters and opens the advanced panel', async () => {
    const user = userEvent.setup()

    render(<FilterSystemHarness />)

    expect(screen.getByLabelText('Search')).toBeInTheDocument()
    expect(screen.queryByLabelText('Hidden only')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /Additional filters/i }))
    expect(screen.getByText('Status')).toHaveClass('text-xs')
    expect(screen.getByLabelText('Hidden only')).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: /reset additional filters/i }),
    ).not.toBeInTheDocument()
  })

  it('keeps the advanced active badge while the disclosure is collapsed', () => {
    render(<FilterSystemHarness initialState={{ hiddenOnly: true }} />)

    expect(screen.getByRole('button', { name: /Additional filters/i })).toHaveAttribute(
      'aria-expanded',
      'false',
    )
    expect(screen.getByText('1 active')).toBeInTheDocument()
    expect(screen.queryByLabelText('Hidden only')).not.toBeInTheDocument()
  })

  it('does not change filter values when the disclosure toggles', async () => {
    const user = userEvent.setup()
    render(<FilterSystemHarness initialState={{ search: 'fire', hiddenOnly: true }} />)

    expect(screen.getByLabelText('Search')).toHaveValue('fire')
    await user.click(screen.getByRole('button', { name: /Additional filters/i }))
    expect(screen.getByLabelText('Search')).toHaveValue('fire')
    expect(screen.getByText('1 active')).toBeInTheDocument()
  })

  it('shows clear filters when primary filters are modified', () => {
    render(<FilterSystemHarness initialState={{ search: 'fire' }} />)
    expect(screen.getByRole('button', { name: 'Clear filters' })).toBeInTheDocument()
  })
  it('clears primary and advanced fields from Clear filters', async () => {
    const user = userEvent.setup()

    function ResetHarness() {
      const { state, setValue, reset } = useFilterState(schema, {
        initialValues: { search: 'spell', status: 'draft', hiddenOnly: true },
      })
      const [advancedOpen, setAdvancedOpen] = useState(true)
      const advancedFields = schema.fields.filter((field) => field.placement === 'advanced')

      return (
        <DataTableFilterRegion
          primaryFilters={
            <FilterBar schema={schema} state={state} onValueChange={setValue} onReset={reset} />
          }
          additionalFilterFields={
            <FilterFieldList
              schema={schema}
              fields={advancedFields}
              state={state}
              idPrefix="filters-advanced"
              onValueChange={setValue}
            />
          }
          additionalFiltersOpen={advancedOpen}
          onAdditionalFiltersOpenChange={setAdvancedOpen}
          activeAdditionalFilterCount={countModifiedFilters(schema, state, 'advanced')}
        />
      )
    }

    render(<ResetHarness />)
    expect(screen.getByLabelText('Search')).toHaveValue('spell')
    await user.click(screen.getByRole('button', { name: 'Clear filters' }))
    expect(screen.getByLabelText('Search')).toHaveValue('')
    expect(screen.queryByText(/active/i)).not.toBeInTheDocument()
  })

  it('calls onReset from the toolbar button', () => {
    const onReset = vi.fn()

    render(<FilterSystemHarness initialState={{ search: 'spell' }} onReset={onReset} />)

    screen.getByRole('button', { name: 'Clear filters' }).click()
    expect(onReset).toHaveBeenCalledTimes(1)
  })

  itAxe('has no axe accessibility violations', async () => {
    const { container } = render(
      <FilterSystemHarness initialState={{ search: 'fire', status: 'draft' }} />,
    )

    await expectNoAxeViolations(container)
  })

  it('aligns a mixed primary row on shared control-band anchors', () => {
    const { container } = render(
      <FilterBar schema={mixedPrimarySchema} state={{}} onValueChange={() => undefined} />,
    )

    expect(container.firstChild).toHaveClass('items-end')
    const anchors = container.querySelectorAll('[data-field-align]')
    expect(anchors.length).toBeGreaterThanOrEqual(2)

    const hitDieLabel = screen.getByText('Hit Die')
    expect(hitDieLabel.tagName).toBe('LABEL')
    expect(hitDieLabel).toHaveAttribute('for', expect.stringContaining('hitDie'))
    expect(screen.getByRole('combobox', { name: 'Hit Die' })).toHaveAttribute(
      'id',
      hitDieLabel.getAttribute('for') ?? '',
    )

    expect(screen.getByLabelText('Search')).toBeInTheDocument()
    expect(screen.getByLabelText('Has Spellcasting')).toBeInTheDocument()
  })

  it('uses outline chrome on boolean shells to match row select and action controls', () => {
    render(
      <DataTableFilterRegion
        primaryFilters={
          <FilterBar schema={mixedPrimarySchema} state={{}} onValueChange={() => undefined} />
        }
        additionalFilterFields={<input aria-label="Advanced field" />}
        additionalFiltersOpen={false}
        onAdditionalFiltersOpenChange={() => undefined}
      />,
    )

    const combobox = screen.getByRole('combobox', { name: 'Hit Die' })
    const checkbox = screen.getByLabelText('Has Spellcasting')
    const checkboxShell = checkbox.closest('[data-field-align]')

    expect(combobox).toHaveClass('bg-input')
    expect(checkboxShell).toBeTruthy()
    expect(checkboxShell).toHaveClass('bg-transparent', 'border-interactive-outline', 'rounded-md')
    expect(checkboxShell).not.toHaveClass('bg-input')
  })

  it('stacks primary fields vertically without forcing full-width controls', () => {
    const { container } = render(
      <FilterBar
        schema={mixedPrimarySchema}
        state={{}}
        orientation="vertical"
        onValueChange={() => undefined}
      />,
    )

    expect(container.firstChild).toHaveClass('flex-col', 'items-start')
    const searchControl = screen.getByLabelText('Search').closest('[class*="flex-[0_1"]')
    expect(searchControl).toBeTruthy()
  })
})
