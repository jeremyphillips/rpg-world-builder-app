import type { Meta, StoryObj } from '@storybook/react-vite'
import { useMemo, useState } from 'react'

import { DataTableFilterRegion } from '../components/ui/data-table-filter-region.client'
import { countModifiedFilters } from './filter-engine'
import {
  createBooleanFilter,
  createChipsFilter,
  createEqualsFilter,
  createTextFilter,
} from './filter-engine.helpers'
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

type MixedState = {
  affordable?: boolean
  school?: string
  levels?: string
}

const mixedToolbarSchema = createFilterSchema<{ name: string }, MixedState>([
  createBooleanFilter<{ name: string }, MixedState, 'affordable'>({
    id: 'affordable',
    label: 'Affordable now',
    placement: 'primary',
    getValue: () => false,
  }),
  createChipsFilter<{ name: string }, MixedState, 'levels'>({
    id: 'levels',
    label: 'Level',
    placement: 'primary',
    selectionMode: 'single-required',
    defaultValue: '__all__',
    options: [
      { value: '__all__', label: 'All' },
      { value: '1', label: '1st' },
    ],
    matches: () => true,
  }),
  createEqualsFilter<{ name: string }, MixedState, 'school', string>({
    id: 'school',
    label: 'School',
    placement: 'primary',
    layout: 'floating',
    allOptionLabel: 'All schools',
    options: [
      { value: 'evocation', label: 'Evocation' },
      { value: 'abjuration', label: 'Abjuration' },
    ],
    getValue: () => 'evocation',
  }),
])

function MixedFloatingToolbarDemo() {
  const { state, setValue } = useFilterState(mixedToolbarSchema)
  return (
    <div className="max-w-3xl bg-background p-4">
      <FilterBar schema={mixedToolbarSchema} state={state} onValueChange={setValue} />
    </div>
  )
}

/** Floating select beside a checkbox and chips. Controls align on their bottom edge. */
export const MixedFloatingToolbar: Story = {
  render: () => <MixedFloatingToolbarDemo />,
}
