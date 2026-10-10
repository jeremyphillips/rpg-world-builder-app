import type { Meta, StoryObj } from '@storybook/react-vite'
import { useMemo, useState } from 'react'

import { countModifiedFilters } from '../../filters/filter-engine'
import {
  createBooleanFilter,
  createEqualsFilter,
  createTextFilter,
} from '../../filters/filter-engine.helpers'
import { createFilterSchema } from '../../filters/filter-schema.types'
import { useFilterState } from '../../filters/use-filter-state.client'
import { DataTableFilterChrome } from './data-table-filter-chrome.client'

type DemoRow = {
  name: string
  status: string
  hidden?: boolean
}

type DemoFilterState = {
  search?: string
  status?: 'draft' | 'published'
  hiddenOnly?: boolean
}

const demoSchema = createFilterSchema<DemoRow, DemoFilterState>([
  createTextFilter<DemoRow, DemoFilterState, 'search'>({
    id: 'search',
    label: 'Search',
    control: 'search',
    placeholder: 'Search content…',
    getSearchText: (row) => row.name,
  }),
  createEqualsFilter<DemoRow, DemoFilterState, 'status', 'draft' | 'published'>({
    id: 'status',
    label: 'Status',
    placement: 'advanced',
    width: 'md',
    options: [
      { value: 'draft', label: 'Draft' },
      { value: 'published', label: 'Published' },
    ],
    getValue: (row) => row.status as 'draft' | 'published',
    showAllOption: true,
  }),
  createBooleanFilter<DemoRow, DemoFilterState, 'hiddenOnly'>({
    id: 'hiddenOnly',
    label: 'Hidden only',
    getValue: (row) => row.hidden === true,
  }),
])

function FilterChromeDemo({
  initialValues,
  disabled = false,
}: {
  initialValues?: Partial<DemoFilterState>
  disabled?: boolean
}) {
  const { state, setValue, reset } = useFilterState(demoSchema, { initialValues })
  const [advancedOpen, setAdvancedOpen] = useState(false)
  const modifiedCount = useMemo(() => countModifiedFilters(demoSchema, state), [state])

  return (
    <div className="flex max-w-4xl flex-col gap-2">
      <DataTableFilterChrome
        filterSchema={demoSchema}
        state={state}
        disabled={disabled}
        onValueChange={setValue}
        onReset={reset}
        advancedOpen={advancedOpen}
        onAdvancedFiltersOpenChange={setAdvancedOpen}
      />
      <p className="text-xs text-muted-foreground">{modifiedCount} modified filter(s)</p>
      <pre className="rounded-md border border-border bg-sunken p-3 text-xs text-muted-foreground">
        {JSON.stringify(state, null, 2)}
      </pre>
    </div>
  )
}

const meta = {
  title: 'Components/DataTableFilterChrome',
  component: DataTableFilterChrome,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Canonical datatable filter composition — compact density, floating selects, schema validation. Prefer this over wiring `DataTableFilterRegion` directly in catalog tables.',
      },
    },
  },
} satisfies Meta<typeof DataTableFilterChrome>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => <FilterChromeDemo />,
  args: {
    filterSchema: demoSchema,
    state: {},
    onValueChange: () => undefined,
    onReset: () => undefined,
    advancedOpen: false,
    onAdvancedFiltersOpenChange: () => undefined,
  },
}

export const WithActiveFilters: Story = {
  render: () => (
    <FilterChromeDemo initialValues={{ search: 'ember', status: 'draft', hiddenOnly: true }} />
  ),
  args: Default.args,
}
