import type { CharacterClass, Spellcasting } from '@rpg/contracts'
import { BooleanCell, SortableHeader } from '@rpg/ui'
import type { ColumnDef, FilterDef } from '@rpg/ui'

import { buildContentColumns, buildContentFilters } from '../../lib/content-table-config'

const CLASS_MIDDLE_COLUMNS: ColumnDef<CharacterClass>[] = [
  {
    accessorKey: 'hitDie',
    header: ({ column }) => <SortableHeader column={column}>Hit Die</SortableHeader>,
    cell: ({ row }) => `d${row.getValue<number>('hitDie')}`,
    filterFn: 'equalsString',
  },
  {
    accessorKey: 'primaryAbilities',
    header: 'Primary Abilities',
    cell: ({ row }) =>
      row.getValue<CharacterClass['primaryAbilities']>('primaryAbilities').join(', ').toUpperCase(),
    enableSorting: false,
  },
  {
    accessorKey: 'spellcasting',
    header: 'Spellcasting',
    cell: ({ row }) => (
      <BooleanCell value={row.getValue<Spellcasting | undefined>('spellcasting') !== undefined} />
    ),
    filterFn: 'boolean',
    enableSorting: false,
  },
]

const CLASS_SPECIFIC_FILTERS: FilterDef[] = [
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
    type: 'boolean',
    id: 'spellcasting',
    label: 'Has Spellcasting',
    group: 'primary',
  },
]

export const classColumns = buildContentColumns(CLASS_MIDDLE_COLUMNS)
export const classFilters = buildContentFilters(CLASS_SPECIFIC_FILTERS)
