/**
 * @vitest-environment jsdom
 */
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { createEqualsFilter, createTextFilter } from '../../filters/filter-engine.helpers'
import { createFilterSchema } from '../../filters/filter-schema.types'
import { countModifiedFilters } from '../../filters/filter-engine'
import { DataTableFilterChrome } from './data-table-filter-chrome.client'

type Row = { name: string; status: string }
type State = { search?: string; status?: string }

const schema = createFilterSchema<Row, State>([
  createTextFilter<Row, State, 'search'>({
    id: 'search',
    label: 'Search',
    control: 'search',
    placeholder: 'Search…',
    getSearchText: (row) => row.name,
  }),
  createEqualsFilter<Row, State, 'status', string>({
    id: 'status',
    label: 'Status',
    placement: 'advanced',
    options: [
      { value: 'draft', label: 'Draft' },
      { value: 'published', label: 'Published' },
    ],
    getValue: (row) => row.status,
    showAllOption: true,
  }),
])

describe('DataTableFilterChrome', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('renders omitted select layout as floating combobox labels', () => {
    const floatingSchema = createFilterSchema<Row, { role?: string }>([
      createEqualsFilter<Row, { role?: string }, 'role', string>({
        id: 'role',
        label: 'Role',
        options: [{ value: 'a', label: 'A' }],
        getValue: (row) => row.name,
      }),
    ])

    render(
      <DataTableFilterChrome
        filterSchema={floatingSchema}
        state={{}}
        onValueChange={() => undefined}
        onReset={() => undefined}
        advancedOpen={false}
        onAdvancedFiltersOpenChange={() => undefined}
      />,
    )

    expect(screen.getByRole('combobox', { name: 'Role' })).toBeInTheDocument()
    expect(screen.queryByText('Role', { selector: 'label' })).not.toBeInTheDocument()
  })

  it('matches advanced modified count from countModifiedFilters', async () => {
    const user = userEvent.setup()

    function Harness() {
      const [advancedOpen, setAdvancedOpen] = useState(false)
      return (
        <DataTableFilterChrome
          filterSchema={schema}
          state={{ status: 'draft' }}
          onValueChange={() => undefined}
          onReset={() => undefined}
          advancedOpen={advancedOpen}
          onAdvancedFiltersOpenChange={setAdvancedOpen}
        />
      )
    }

    render(<Harness />)

    const expected = countModifiedFilters(schema, { status: 'draft' }, 'advanced')
    expect(screen.getByText(`${expected} active`)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /additional filters/i }))
    expect(screen.getByRole('combobox', { name: 'Status' })).toBeInTheDocument()
  })

  it('dev validation rejects stacked select layout and still renders floating', () => {
    vi.stubEnv('NODE_ENV', 'development')
    vi.spyOn(console, 'error').mockImplementation(() => undefined)

    const invalidSchema = createFilterSchema<Row, { role?: string }>([
      createEqualsFilter<Row, { role?: string }, 'role', string>({
        id: 'role',
        label: 'Role',
        layout: 'stacked',
        options: [{ value: 'a', label: 'A' }],
        getValue: (row) => row.name,
      }),
    ])

    expect(() =>
      render(
        <DataTableFilterChrome
          filterSchema={invalidSchema}
          state={{}}
          onValueChange={() => undefined}
          onReset={() => undefined}
          advancedOpen={false}
          onAdvancedFiltersOpenChange={() => undefined}
        />,
      ),
    ).toThrow(/layout "stacked"/)
  })
})
