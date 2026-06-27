import type { CharacterClass, Spellcasting } from '@rpg/contracts'
import { BooleanCell, dataTableTypographyMeta, dataTableWidthMeta, SortableHeader } from '@rpg/ui'
import type { ColumnDef, FilterDef } from '@rpg/ui'

import { ROUTES } from '@/app/routes'
import { buildContentColumns, buildContentFilters } from '../../lib/content-table-config'

const CLASS_MIDDLE_COLUMNS: ColumnDef<CharacterClass>[] = [
  {
    accessorKey: 'hitDie',
    header: ({ column }) => <SortableHeader column={column}>Hit Die</SortableHeader>,
    cell: ({ row }) => `d${row.getValue<number>('hitDie')}`,
    filterFn: 'equalsString',
    meta: { label: 'Hit Die', ...dataTableWidthMeta('tiny') },
  },
  {
    accessorKey: 'primaryAbilities',
    header: 'Primary Abilities',
    cell: ({ row }) =>
      row.getValue<CharacterClass['primaryAbilities']>('primaryAbilities').join(', ').toUpperCase(),
    enableSorting: false,
    meta: {
      label: 'Primary Abilities',
      ...dataTableWidthMeta('medium'),
      ...dataTableTypographyMeta('stat'),
    },
  },
  {
    accessorKey: 'spellcasting',
    header: 'Spellcasting',
    cell: ({ row }) => (
      <BooleanCell value={row.getValue<Spellcasting | undefined>('spellcasting') !== undefined} />
    ),
    filterFn: 'boolean',
    enableSorting: false,
    meta: { label: 'Spellcasting', ...dataTableWidthMeta('compactCenter') },
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

/** Class column definitions with the name cell linked to the class detail page. */
export function classColumns(campaignId: string) {
  return buildContentColumns<CharacterClass>(CLASS_MIDDLE_COLUMNS, {
    nameHref: (row) => ROUTES.content.classes.detail(campaignId, row.id),
  })
}

export const classFilters = buildContentFilters(CLASS_SPECIFIC_FILTERS)
