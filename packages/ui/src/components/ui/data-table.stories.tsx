import * as React from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import type { ColumnDef } from '@tanstack/react-table'

import {
  BooleanCell,
  DataTable,
  NameCell,
  RowActionsMenu,
  SortableHeader,
  TableBadgeCell,
} from './data-table.client'
import { dataTableColumnMeta, dataTableWidthMeta } from './data-table-meta'
import type { DataTableProps } from './data-table.types'
import {
  createEqualsFilter,
  createTextFilter,
  createFilterSchema,
  FilterAdvancedPanel,
  FilterBar,
  applyFilterSchema,
  useFilterState,
} from '../../filters'

// ---------------------------------------------------------------------------
// Shared fixture data + types
// ---------------------------------------------------------------------------

interface CharacterClass {
  id: string
  imageKey?: string
  name: string
  hitDie: number
  primaryAbility: string
  spellcasting: boolean
  source: 'system' | 'homebrew'
}

const CLASSES: CharacterClass[] = [
  {
    id: '1',
    name: 'Barbarian',
    hitDie: 12,
    primaryAbility: 'STR',
    spellcasting: false,
    source: 'system',
  },
  { id: '2', name: 'Bard', hitDie: 8, primaryAbility: 'CHA', spellcasting: true, source: 'system' },
  {
    id: '3',
    name: 'Cleric',
    hitDie: 8,
    primaryAbility: 'WIS',
    spellcasting: true,
    source: 'system',
  },
  {
    id: '4',
    name: 'Druid',
    hitDie: 8,
    primaryAbility: 'WIS',
    spellcasting: true,
    source: 'system',
  },
  {
    id: '5',
    name: 'Fighter',
    hitDie: 10,
    primaryAbility: 'STR',
    spellcasting: false,
    source: 'system',
  },
  {
    id: '6',
    name: 'Monk',
    hitDie: 8,
    primaryAbility: 'DEX',
    spellcasting: false,
    source: 'system',
  },
  {
    id: '7',
    name: 'Paladin',
    hitDie: 10,
    primaryAbility: 'STR',
    spellcasting: true,
    source: 'system',
  },
  {
    id: '8',
    name: 'Ranger',
    hitDie: 10,
    primaryAbility: 'DEX',
    spellcasting: true,
    source: 'system',
  },
  {
    id: '9',
    name: 'Rogue',
    hitDie: 8,
    primaryAbility: 'DEX',
    spellcasting: false,
    source: 'system',
  },
  {
    id: '10',
    name: 'Sorcerer',
    hitDie: 6,
    primaryAbility: 'CHA',
    spellcasting: true,
    source: 'system',
  },
  {
    id: '11',
    name: 'Warlock',
    hitDie: 8,
    primaryAbility: 'CHA',
    spellcasting: true,
    source: 'system',
  },
  {
    id: '12',
    name: 'Wizard',
    hitDie: 6,
    primaryAbility: 'INT',
    spellcasting: true,
    source: 'system',
  },
  {
    id: '13',
    name: 'Artificer',
    hitDie: 8,
    primaryAbility: 'INT',
    spellcasting: true,
    source: 'homebrew',
  },
]

const BASE_COLUMNS: ColumnDef<CharacterClass>[] = [
  {
    accessorKey: 'imageKey',
    header: () => <span className="sr-only">Image</span>,
    cell: () => (
      <div
        className="size-6 shrink-0 rounded-md bg-muted lg:size-8"
        aria-hidden="true"
        role="presentation"
      />
    ),
    enableSorting: false,
    meta: {
      ...dataTableColumnMeta.identity,
      ...dataTableWidthMeta('image'),
      label: 'Image',
    },
  },
  {
    accessorKey: 'name',
    header: ({ column }) => <SortableHeader column={column}>Name</SortableHeader>,
    cell: ({ row }) => <NameCell>{row.getValue<string>('name')}</NameCell>,
    meta: { ...dataTableColumnMeta.identity, ...dataTableWidthMeta('title'), label: 'Name' },
  },
  {
    accessorKey: 'hitDie',
    header: ({ column }) => <SortableHeader column={column}>Hit Die</SortableHeader>,
    cell: ({ row }) => `d${row.getValue('hitDie')}`,
    meta: { ...dataTableColumnMeta.data, ...dataTableWidthMeta('compact'), label: 'Hit Die' },
  },
  {
    accessorKey: 'primaryAbility',
    header: 'Primary Ability',
    meta: { ...dataTableColumnMeta.data, label: 'Primary Ability' },
  },
  {
    accessorKey: 'spellcasting',
    header: 'Spellcasting',
    cell: ({ row }) => <BooleanCell value={row.getValue('spellcasting')} />,
    meta: {
      ...dataTableColumnMeta.data,
      ...dataTableWidthMeta('compactCenter'),
      label: 'Spellcasting',
    },
  },
  {
    accessorKey: 'source',
    header: 'Source',
    cell: ({ row }) => {
      const source = row.getValue<'system' | 'homebrew'>('source')
      return (
        <TableBadgeCell appearance={source === 'system' ? 'neutral' : 'outline'} tone="neutral">
          {source === 'system' ? 'System' : 'Homebrew'}
        </TableBadgeCell>
      )
    },
    meta: { ...dataTableColumnMeta.source, ...dataTableWidthMeta('compact'), label: 'Source' },
  },
]

type ClassFilterState = {
  name?: string
  hitDie?: string
  source?: 'system' | 'homebrew'
}

const classFilterSchema = createFilterSchema<CharacterClass, ClassFilterState>([
  createTextFilter({
    id: 'name',
    label: 'Name',
    placeholder: 'Search classes…',
    getSearchText: (row) => row.name,
  }),
  createEqualsFilter({
    id: 'hitDie',
    label: 'Hit Die',
    options: [
      { label: 'd6', value: '6' },
      { label: 'd8', value: '8' },
      { label: 'd10', value: '10' },
      { label: 'd12', value: '12' },
    ],
    getValue: (row) => String(row.hitDie),
  }),
  createEqualsFilter({
    id: 'source',
    label: 'Source',
    placement: 'advanced',
    options: [
      { label: 'System', value: 'system' },
      { label: 'Homebrew', value: 'homebrew' },
    ],
    getValue: (row) => row.source,
  }),
])

// ---------------------------------------------------------------------------
// Typed wrapper — gives Storybook a concrete non-generic component type so
// that story args are properly inferred without fighting ColumnDef generics.
// ---------------------------------------------------------------------------

function ClassDataTable(props: DataTableProps<CharacterClass>) {
  return <DataTable {...props} />
}

function ClassDataTableWithFilters() {
  const { state, setValue, reset } = useFilterState(classFilterSchema)
  const [advancedOpen, setAdvancedOpen] = React.useState(false)
  const filteredRows = React.useMemo(
    () => applyFilterSchema(classFilterSchema, state, CLASSES),
    [state],
  )

  return (
    <div className="flex flex-col gap-3">
      <FilterBar
        schema={classFilterSchema}
        state={state}
        onValueChange={setValue}
        onReset={reset}
        advancedOpen={advancedOpen}
        onAdvancedOpenChange={setAdvancedOpen}
      />
      <FilterAdvancedPanel
        schema={classFilterSchema}
        state={state}
        open={advancedOpen}
        onValueChange={setValue}
        onClearAll={reset}
      />
      <DataTable columns={BASE_COLUMNS} data={filteredRows} defaultPageSize={10} />
    </div>
  )
}

// ---------------------------------------------------------------------------
// Meta
// ---------------------------------------------------------------------------

const meta = {
  title: 'Components/DataTable',
  component: ClassDataTable,
  parameters: {
    layout: 'padded',
  },
} satisfies Meta<typeof ClassDataTable>

export default meta
type Story = StoryObj<typeof meta>

// ---------------------------------------------------------------------------
// Stories
// ---------------------------------------------------------------------------

export const Basic: Story = {
  args: {
    columns: BASE_COLUMNS,
    data: CLASSES,
    defaultPageSize: 10,
  },
}

export const WithExternalFilters: Story = {
  name: 'With External Filters',
  args: {
    columns: BASE_COLUMNS,
    data: CLASSES,
  },
  render: () => <ClassDataTableWithFilters />,
}

export const WithRowSelection: Story = {
  args: {
    columns: BASE_COLUMNS,
    data: CLASSES,
    enableRowSelection: true,
    onRowSelectionChange: (rows) => console.log('Selected:', rows),
    defaultPageSize: 10,
  },
}

// Per-row stateful wrapper so each row manages its own enabled state independently.
function ClassRowActions({ row }: { row: CharacterClass }) {
  const [enabled, setEnabled] = React.useState(true)
  return (
    <RowActionsMenu
      editHref={`/classes/${row.id}/edit`}
      enabled={enabled}
      onToggleEnabled={setEnabled}
      enabledTooltip="Hides this class from players in the current campaign. The class remains available globally."
      itemLabel="class"
    />
  )
}

export const WithRowActions: Story = {
  args: {
    columns: BASE_COLUMNS,
    data: CLASSES,
    enableRowSelection: true,
    rowActions: (row) => <ClassRowActions row={row} />,
    defaultPageSize: 10,
  },
}

export const EmptyState: Story = {
  args: {
    columns: BASE_COLUMNS,
    data: [],
  },
}

export const WithCaption: Story = {
  args: {
    columns: BASE_COLUMNS,
    data: CLASSES,
    caption: 'SRD 5.2.1 character classes',
    defaultPageSize: 10,
  },
}
