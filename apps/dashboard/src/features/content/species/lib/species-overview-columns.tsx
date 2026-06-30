import type { Species } from '@rpg/contracts'
import { getCreatureSizeLabel } from '@rpg/contracts'
import { dataTableWidthMeta, SortableHeader } from '@rpg/ui'
import type { ColumnDef, FilterDef } from '@rpg/ui'

import { ROUTES } from '@/app/routes'
import type { CreatureTypeVocabulary } from '@/features/homebrew'
import {
  buildActiveCreatureTypeFieldOptions,
  getCreatureTypeLabel as getVocabularyCreatureTypeLabel,
} from '@/features/homebrew'

import { buildContentColumns, buildContentFilters } from '../../lib/content-table-config'
import { getCreatureTypeLabel } from '../../lib/creature-type-field-options'

function speciesMiddleColumns(vocabulary?: CreatureTypeVocabulary): ColumnDef<Species>[] {
  return [
    {
      accessorKey: 'creatureType',
      header: ({ column }) => <SortableHeader column={column}>Type</SortableHeader>,
      cell: ({ row }) =>
        vocabulary
          ? getVocabularyCreatureTypeLabel(vocabulary, row.getValue<string>('creatureType'))
          : getCreatureTypeLabel(row.getValue<string>('creatureType')),
      filterFn: 'equalsString',
      meta: { label: 'Type', ...dataTableWidthMeta('medium') },
    },
    {
      id: 'sizes',
      accessorFn: (row) => row.sizes.map(getCreatureSizeLabel).join(' / '),
      header: ({ column }) => <SortableHeader column={column}>Size</SortableHeader>,
      cell: ({ row }) => row.getValue<string>('sizes'),
      meta: { label: 'Size', ...dataTableWidthMeta('medium') },
    },
    {
      id: 'speed',
      accessorFn: (row) => row.speed.walk,
      header: ({ column }) => <SortableHeader column={column}>Speed</SortableHeader>,
      cell: ({ row }) => `${row.original.speed.walk} ft.`,
      meta: { label: 'Speed', ...dataTableWidthMeta('tiny') },
    },
  ]
}

function speciesSpecificFilters(vocabulary?: CreatureTypeVocabulary): FilterDef[] {
  const options = vocabulary
    ? buildActiveCreatureTypeFieldOptions(vocabulary)
    : [{ label: 'Humanoid', value: 'humanoid' }]

  return [
    {
      type: 'select',
      id: 'creatureType',
      label: 'Creature Type',
      options,
    },
  ]
}

/** Species column definitions with the name cell linked to the species detail page. */
export function speciesColumns(campaignId: string, vocabulary?: CreatureTypeVocabulary) {
  return buildContentColumns<Species>(speciesMiddleColumns(vocabulary), {
    nameHref: (row) => ROUTES.content.species.detail(campaignId, row.id),
  })
}

export function speciesFilters(vocabulary?: CreatureTypeVocabulary) {
  return buildContentFilters(speciesSpecificFilters(vocabulary))
}
