import type { Meta, StoryObj } from '@storybook/react-vite'
import type { ColumnDef } from '@tanstack/react-table'

import { DataTable, SortableHeader } from './data-table.client'
import type { DataTableProps, FilterDef } from './data-table.types'

// ---------------------------------------------------------------------------
// Shared fixture data + types
// ---------------------------------------------------------------------------

interface CharacterClass {
  id: string
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
    accessorKey: 'name',
    header: ({ column }) => <SortableHeader column={column}>Name</SortableHeader>,
  },
  {
    accessorKey: 'hitDie',
    header: ({ column }) => <SortableHeader column={column}>Hit Die</SortableHeader>,
    cell: ({ row }) => `d${row.getValue('hitDie')}`,
    // hitDie is a number — equalsString converts both sides for select filter
    filterFn: 'equalsString',
  },
  {
    accessorKey: 'primaryAbility',
    header: 'Primary Ability',
  },
  {
    accessorKey: 'spellcasting',
    header: 'Spellcasting',
    cell: ({ row }) => (row.getValue('spellcasting') ? 'Yes' : '—'),
    filterFn: 'boolean',
  },
  {
    accessorKey: 'source',
    header: 'Source',
    cell: ({ row }) => <span className="capitalize">{row.getValue('source')}</span>,
  },
]

const ALL_FILTERS: FilterDef[] = [
  { type: 'text', id: 'name', label: 'Name', placeholder: 'Search classes…' },
  {
    type: 'select',
    id: 'hitDie',
    label: 'Hit Die',
    options: [
      { label: 'd6', value: '6' },
      { label: 'd8', value: '8' },
      { label: 'd10', value: '10' },
      { label: 'd12', value: '12' },
    ],
  },
  {
    type: 'select',
    id: 'source',
    label: 'Source',
    options: [
      { label: 'System', value: 'system' },
      { label: 'Homebrew', value: 'homebrew' },
    ],
    group: 'secondary',
  },
  { type: 'boolean', id: 'spellcasting', label: 'Has Spellcasting' },
]

// ---------------------------------------------------------------------------
// Typed wrapper — gives Storybook a concrete non-generic component type so
// that story args are properly inferred without fighting ColumnDef generics.
// ---------------------------------------------------------------------------

function ClassDataTable(props: DataTableProps<CharacterClass>) {
  return <DataTable {...props} />
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

export const WithFilters: Story = {
  name: 'With Filters (primary)',
  args: {
    columns: BASE_COLUMNS,
    data: CLASSES,
    filters: [
      { type: 'text', id: 'name', label: 'Name', placeholder: 'Search classes…' },
      {
        type: 'select',
        id: 'hitDie',
        label: 'Hit Die',
        options: [
          { label: 'd6', value: '6' },
          { label: 'd8', value: '8' },
          { label: 'd10', value: '10' },
          { label: 'd12', value: '12' },
        ],
      },
    ],
    defaultPageSize: 10,
  },
}

export const WithAdvancedFilters: Story = {
  name: 'With Advanced Filters (primary + secondary)',
  args: {
    columns: BASE_COLUMNS,
    data: CLASSES,
    filters: ALL_FILTERS,
    defaultPageSize: 10,
  },
}

export const WithRowSelection: Story = {
  args: {
    columns: BASE_COLUMNS,
    data: CLASSES,
    filters: [{ type: 'text', id: 'name', label: 'Name', placeholder: 'Search…' }],
    enableRowSelection: true,
    onRowSelectionChange: (rows) => console.log('Selected:', rows),
    defaultPageSize: 10,
  },
}

export const WithRowActions: Story = {
  args: {
    columns: BASE_COLUMNS,
    data: CLASSES,
    filters: [{ type: 'text', id: 'name', label: 'Name', placeholder: 'Search…' }],
    enableRowSelection: true,
    rowActions: (row) => (
      <button
        type="button"
        className="text-xs text-muted-foreground hover:text-foreground"
        onClick={() => alert(`Edit: ${row.name}`)}
      >
        Edit
      </button>
    ),
    defaultPageSize: 10,
  },
}

export const EmptyState: Story = {
  args: {
    columns: BASE_COLUMNS,
    data: [],
    filters: [{ type: 'text', id: 'name', label: 'Name', placeholder: 'Search…' }],
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
