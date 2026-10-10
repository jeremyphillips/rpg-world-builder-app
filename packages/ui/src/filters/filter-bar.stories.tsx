import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'

import { DataTableFilterChrome } from '../components/ui/data-table-filter-chrome.client'
import {
  createBooleanFilter,
  createChipsFilter,
  createEqualsFilter,
  createTextFilter,
} from './filter-engine.helpers'
import { createFilterSchema } from './filter-schema.types'
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
      <DataTableFilterChrome
        filterSchema={demoSchema}
        state={state}
        disabled={disabled}
        onValueChange={setValue}
        onReset={reset}
        advancedOpen={advancedOpen}
        onAdvancedFiltersOpenChange={setAdvancedOpen}
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

  return (
    <div className="flex max-w-4xl flex-col gap-2">
      <DataTableFilterChrome
        filterSchema={classesLikeSchema}
        state={state}
        onValueChange={setValue}
        onReset={reset}
        advancedOpen={advancedOpen}
        onAdvancedFiltersOpenChange={setAdvancedOpen}
      />
    </div>
  )
}

/** Classes-like primary row. Omitted select layout floats inside the catalog region. */
export const ClassesLikePrimaryRow: Story = {
  render: () => <ClassesLikePrimaryRowDemo />,
}

type DenseState = {
  search?: string
  hitDie?: string
  ability?: string
  feature?: string
  spellcasting?: boolean
  source?: string
  status?: string
  availability?: string
  modeling?: string
}

const denseSchema = createFilterSchema<DemoRow, DenseState>([
  createTextFilter<DemoRow, DenseState, 'search'>({
    id: 'search',
    label: 'Search',
    placeholder: 'Search classes…',
    getSearchText: (row) => row.name,
  }),
  createEqualsFilter<DemoRow, DenseState, 'hitDie', string>({
    id: 'hitDie',
    label: 'Hit Die',
    width: 'md',
    options: [
      { value: '6', label: 'd6' },
      { value: '8', label: 'd8' },
    ],
    getValue: () => '8',
  }),
  createBooleanFilter<DemoRow, DenseState, 'spellcasting'>({
    id: 'spellcasting',
    label: 'Has spellcasting',
    placement: 'primary',
    getValue: () => false,
  }),
  createEqualsFilter<DemoRow, DenseState, 'ability', string>({
    id: 'ability',
    label: 'Primary Ability',
    width: 'lg',
    options: [{ value: 'str', label: 'Strength' }],
    getValue: () => 'str',
  }),
  createEqualsFilter<DemoRow, DenseState, 'feature', string>({
    id: 'feature',
    label: 'Features',
    width: 'md',
    options: [{ value: 'rage', label: 'Rage' }],
    getValue: () => 'rage',
  }),
  createEqualsFilter<DemoRow, DenseState, 'source', string>({
    id: 'source',
    label: 'Source',
    placement: 'advanced',
    width: 'md',
    defaultValue: 'system',
    options: [
      { value: 'system', label: 'System' },
      { value: 'homebrew', label: 'Homebrew' },
    ],
    getValue: () => 'system',
  }),
  createEqualsFilter<DemoRow, DenseState, 'status', string>({
    id: 'status',
    label: 'Status',
    placement: 'advanced',
    width: 'md',
    options: [{ value: 'published', label: 'Published' }],
    getValue: () => 'published',
  }),
  createEqualsFilter<DemoRow, DenseState, 'availability', string>({
    id: 'availability',
    label: 'Campaign availability',
    placement: 'advanced',
    width: 'lg',
    defaultValue: 'available',
    options: [
      { value: 'available', label: 'Available' },
      { value: 'unavailable', label: 'Unavailable' },
    ],
    getValue: () => 'available',
  }),
  createEqualsFilter<DemoRow, DenseState, 'modeling', string>({
    id: 'modeling',
    label: 'Modeling',
    placement: 'advanced',
    width: 'md',
    options: [{ value: 'draft', label: 'Draft' }],
    getValue: () => 'draft',
  }),
])

function DenseFiltersDemo() {
  const { state, setValue, reset } = useFilterState(denseSchema, {
    initialValues: { source: 'homebrew', status: 'published', modeling: 'draft' },
  })
  const [advancedOpen, setAdvancedOpen] = useState(true)

  return (
    <div className="max-w-5xl">
      <DataTableFilterChrome
        filterSchema={denseSchema}
        state={state}
        onValueChange={setValue}
        onReset={reset}
        advancedOpen={advancedOpen}
        onAdvancedFiltersOpenChange={setAdvancedOpen}
      />
    </div>
  )
}

/** Many primary fields plus four advanced fields in one panel. */
export const DenseFilters: Story = {
  render: () => <DenseFiltersDemo />,
}

const minimalSchema = createFilterSchema<DemoRow, { search?: string; hitDie?: string }>([
  createTextFilter<DemoRow, { search?: string; hitDie?: string }, 'search'>({
    id: 'search',
    label: 'Search',
    placeholder: 'Search classes…',
    getSearchText: (row) => row.name,
  }),
  createEqualsFilter<DemoRow, { search?: string; hitDie?: string }, 'hitDie', string>({
    id: 'hitDie',
    label: 'Hit Die',
    width: 'md',
    options: [{ value: '8', label: 'd8' }],
    getValue: () => '8',
  }),
])

function MinimalPrimaryRowDemo() {
  const { state, setValue, reset } = useFilterState(minimalSchema)

  return (
    <div className="max-w-3xl">
      <DataTableFilterChrome
        filterSchema={minimalSchema}
        state={state}
        onValueChange={setValue}
        onReset={reset}
        advancedOpen={false}
        onAdvancedFiltersOpenChange={() => undefined}
      />
    </div>
  )
}

/** Search and one select. No disclosure when the schema has no advanced fields. */
export const MinimalPrimaryRow: Story = {
  render: () => <MinimalPrimaryRowDemo />,
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
