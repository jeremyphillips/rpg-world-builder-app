import type { CharacterClass, Spellcasting, WithCampaignAccess } from '@rpg/contracts'
import { BooleanCell, dataTableTypographyMeta, dataTableWidthMeta, SortableHeader } from '@rpg/ui'
import type { ColumnDef } from '@rpg/ui'
import { createBooleanFilter, createEqualsFilter } from '@rpg/ui/filters'

import { ROUTES } from '@/app/routes'
import { buildContentColumns } from '../../lib/overview/content-table-config'
import {
  buildContentFilterSchema,
  type ContentOverviewBaseFilterState,
} from '../../lib/overview/content-overview-filter-schema'

type ClassRow = WithCampaignAccess<CharacterClass>

export type ClassesOverviewFilterState = ContentOverviewBaseFilterState & {
  hitDie?: string
  spellcasting?: boolean
}

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

export const classFilterSchema = buildContentFilterSchema<ClassRow, ClassesOverviewFilterState>([
  createEqualsFilter<ClassRow, ClassesOverviewFilterState, 'hitDie', string>({
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
  createBooleanFilter<ClassRow, ClassesOverviewFilterState, 'spellcasting'>({
    id: 'spellcasting',
    label: 'Has Spellcasting',
    placement: 'primary',
    getValue: (row) => row.spellcasting !== undefined,
  }),
])

/** Class column definitions with the name cell linked to the class detail page. */
export function classColumns(campaignId: string) {
  return buildContentColumns<CharacterClass>(CLASS_MIDDLE_COLUMNS, {
    nameHref: (row) => ROUTES.content.classes.detail(campaignId, row.id),
  })
}
