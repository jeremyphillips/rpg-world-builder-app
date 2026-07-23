import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'

import { createBooleanFilter, createEqualsFilter, createTextFilter } from './filter-engine.helpers'
import { createFilterSchema } from './filter-schema.types'
import { FilterAdvancedPanel } from './filter-advanced-panel.client'
import { FilterBar } from './filter-bar.client'
import { useFilterState } from './use-filter-state.client'

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
    placeholder: 'Search content…',
    getSearchText: (row) => row.name,
  }),
  createEqualsFilter<DemoRow, DemoFilterState, 'status', 'draft' | 'published'>({
    id: 'status',
    label: 'Status',
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

function FilterSystemDemo({
  initialValues,
  disabled = false,
}: {
  initialValues?: Partial<DemoFilterState>
  disabled?: boolean
}) {
  const { state, setValue, reset } = useFilterState(demoSchema, { initialValues })
  const [advancedOpen, setAdvancedOpen] = useState(false)

  return (
    <div className="flex max-w-4xl flex-col gap-2">
      <FilterBar
        schema={demoSchema}
        state={state}
        disabled={disabled}
        advancedOpen={advancedOpen}
        onAdvancedOpenChange={setAdvancedOpen}
        onValueChange={setValue}
        onReset={reset}
      />
      <FilterAdvancedPanel
        schema={demoSchema}
        state={state}
        open={advancedOpen}
        disabled={disabled}
        onValueChange={setValue}
        onClearAll={reset}
      />
      <pre className="rounded-md border border-border bg-sunken p-3 text-xs text-muted-foreground">
        {JSON.stringify(state, null, 2)}
      </pre>
    </div>
  )
}

const meta = {
  title: 'Filters/FilterBar',
  component: FilterSystemDemo,
} satisfies Meta<typeof FilterSystemDemo>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {},
}

export const WithSelections: Story = {
  args: {
    initialValues: { search: 'fire', status: 'draft', hiddenOnly: true },
  },
}

export const Disabled: Story = {
  args: {
    initialValues: { search: 'spell', status: 'published' },
    disabled: true,
  },
}

export const AdvancedOpen: Story = {
  render: () => <FilterSystemDemo initialValues={{ hiddenOnly: true }} />,
}
