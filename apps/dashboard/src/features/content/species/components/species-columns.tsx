import type { Species } from '@rpg/contracts'
import { getCreatureSizeLabel } from '@rpg/contracts'
import { SortableHeader } from '@rpg/ui'
import type { ColumnDef, FilterDef } from '@rpg/ui'

import { ROUTES } from '@/app/routes'
import { buildContentColumns, buildContentFilters } from '../../lib/content-table-config'
import {
  CREATURE_TYPES,
  getSeedCreatureTypeDisplayLabel,
} from '../../lib/seed-creature-type-helpers'

const SPECIES_MIDDLE_COLUMNS: ColumnDef<Species>[] = [
  {
    accessorKey: 'creatureType',
    header: ({ column }) => <SortableHeader column={column}>Type</SortableHeader>,
    cell: ({ row }) => getSeedCreatureTypeDisplayLabel(row.getValue<string>('creatureType')),
    filterFn: 'equalsString',
    meta: { label: 'Type' },
  },
  {
    id: 'sizes',
    accessorFn: (row) => row.sizes.map(getCreatureSizeLabel).join(' / '),
    header: ({ column }) => <SortableHeader column={column}>Size</SortableHeader>,
    cell: ({ row }) => row.getValue<string>('sizes'),
    meta: { label: 'Size' },
  },
  {
    id: 'speed',
    accessorFn: (row) => row.speed.walk,
    header: ({ column }) => <SortableHeader column={column}>Speed</SortableHeader>,
    cell: ({ row }) => `${row.original.speed.walk} ft.`,
    meta: { label: 'Speed' },
  },
]

const SPECIES_SPECIFIC_FILTERS: FilterDef[] = [
  {
    type: 'select',
    id: 'creatureType',
    label: 'Creature Type',
    options: CREATURE_TYPES.map((value) => ({
      label: getSeedCreatureTypeDisplayLabel(value),
      value,
    })),
  },
]

/** Species column definitions with the name cell linked to the species detail page. */
export function speciesColumns(campaignId: string) {
  return buildContentColumns<Species>(SPECIES_MIDDLE_COLUMNS, {
    nameHref: (row) => ROUTES.content.species.detail(campaignId, row.id),
  })
}

export const speciesFilters = buildContentFilters(SPECIES_SPECIFIC_FILTERS)
