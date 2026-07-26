import type { Meta, StoryObj } from '@storybook/react-vite'
import { useMemo, useState } from 'react'

import { DataTableFilterRegion } from '../components/ui/data-table-filter-region.client'
import { countModifiedFilters } from './filter-engine'
import { createBooleanFilter, createEqualsFilter, createTextFilter } from './filter-engine.helpers'
import { createFilterSchema } from './filter-schema.types'
import { FilterBar } from './filter-bar.client'
import { FilterFieldList } from './filter-fields.client'
import { getSchemaFieldsByPlacement } from './filter-bar.lib'
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
  const advancedFields = useMemo(() => getSchemaFieldsByPlacement(demoSchema, 'advanced'), [])
  const advancedModifiedCount = countModifiedFilters(demoSchema, state, 'advanced')

  return (
    <div className="flex max-w-4xl flex-col gap-2">
      <DataTableFilterRegion
        primaryFilters={
          <FilterBar
            schema={demoSchema}
            state={state}
            disabled={disabled}
            onValueChange={setValue}
            onReset={reset}
          />
        }
        additionalFilterFields={
          <FilterFieldList
            schema={demoSchema}
            fields={advancedFields}
            state={state}
            disabled={disabled}
            idPrefix="filters-advanced"
            onValueChange={setValue}
          />
        }
        additionalFiltersOpen={advancedOpen}
        onAdditionalFiltersOpenChange={setAdvancedOpen}
        activeAdditionalFilterCount={advancedModifiedCount}
        onResetAdditionalFilters={reset}
        disabled={disabled}
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

type ClassesLikeState = {
  search?: string
  hitDie?: string
  spellcasting?: boolean
  status?: 'draft' | 'published'
}

const classesLikeSchema = createFilterSchema<DemoRow, ClassesLikeState>([
  createTextFilter<DemoRow, ClassesLikeState, 'search'>({
    id: 'search',
    label: 'Search',
    placeholder: 'Search…',
    getSearchText: (row) => row.name,
  }),
  createEqualsFilter<DemoRow, ClassesLikeState, 'hitDie', string>({
    id: 'hitDie',
    label: 'Hit Die',
    layout: 'stacked',
    width: 'md',
    options: [
      { value: '6', label: 'd6' },
      { value: '8', label: 'd8' },
      { value: '10', label: 'd10' },
      { value: '12', label: 'd12' },
    ],
    getValue: () => '8',
  }),
  createBooleanFilter<DemoRow, ClassesLikeState, 'spellcasting'>({
    id: 'spellcasting',
    label: 'Has Spellcasting',
    placement: 'primary',
    getValue: () => false,
  }),
  createEqualsFilter<DemoRow, ClassesLikeState, 'status', 'draft' | 'published'>({
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
  }),
])

function ClassesLikePrimaryRowDemo() {
  const { state, setValue, reset } = useFilterState(classesLikeSchema)
  const [advancedOpen, setAdvancedOpen] = useState(false)
  const advancedFields = useMemo(
    () => getSchemaFieldsByPlacement(classesLikeSchema, 'advanced'),
    [],
  )
  const advancedModifiedCount = countModifiedFilters(classesLikeSchema, state, 'advanced')

  return (
    <div className="flex max-w-4xl flex-col gap-2">
      <DataTableFilterRegion
        primaryFilters={
          <FilterBar
            schema={classesLikeSchema}
            state={state}
            onValueChange={setValue}
            onReset={reset}
          />
        }
        additionalFilterFields={
          <FilterFieldList
            schema={classesLikeSchema}
            fields={advancedFields}
            state={state}
            idPrefix="filters-advanced"
            onValueChange={setValue}
          />
        }
        additionalFiltersOpen={advancedOpen}
        onAdditionalFiltersOpenChange={setAdvancedOpen}
        activeAdditionalFilterCount={advancedModifiedCount}
        onResetAdditionalFilters={reset}
      />
    </div>
  )
}

/** Classes-like primary row: search + stacked select + boolean + More filters action. */
export const ClassesLikePrimaryRow: Story = {
  render: () => <ClassesLikePrimaryRowDemo />,
}
