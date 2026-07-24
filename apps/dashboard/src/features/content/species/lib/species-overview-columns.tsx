import type { Species, WithCampaignAccess } from '@rpg/contracts'
import { formatMovementDisplay, getCreatureSizeLabel } from '@rpg/contracts'
import { dataTableWidthMeta, SortableHeader } from '@rpg/ui'
import type { ColumnDef } from '@rpg/ui'
import { createEqualsFilter } from '@rpg/ui/filters'

import { ROUTES } from '@/app/routes'
import type { CreatureTypeVocabulary } from '@/features/homebrew'
import {
  buildActiveCreatureTypeFieldOptions,
  getCreatureTypeLabel as getVocabularyCreatureTypeLabel,
} from '@/features/homebrew'

import { buildContentColumns } from '../../lib/overview/content-table-config'
import {
  buildContentFilterSchema,
  type ContentOverviewBaseFilterState,
} from '../../lib/overview/content-overview-filter-schema'
import { getCreatureTypeLabel } from './creature-type-field-options'
import { SPECIES_STAT_LABELS } from './species-display'

type SpeciesRow = WithCampaignAccess<Species>

export type SpeciesOverviewFilterState = ContentOverviewBaseFilterState & {
  creatureType?: string
}

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
      id: 'movement',
      accessorFn: (row) => formatMovementDisplay(row.movement),
      header: ({ column }) => <SortableHeader column={column}>Movement</SortableHeader>,
      cell: ({ row }) => row.getValue<string>('movement'),
      meta: { label: 'Movement', ...dataTableWidthMeta('medium') },
    },
  ]
}

function buildSpeciesFilterSchema(vocabulary?: CreatureTypeVocabulary) {
  const options = vocabulary
    ? buildActiveCreatureTypeFieldOptions(vocabulary)
    : [{ label: 'Humanoid', value: 'humanoid' }]

  return buildContentFilterSchema<SpeciesRow, SpeciesOverviewFilterState>([
    createEqualsFilter<SpeciesRow, SpeciesOverviewFilterState, 'creatureType', string>({
      id: 'creatureType',
      label: SPECIES_STAT_LABELS.creatureType,
      options,
      getValue: (row) => row.creatureType,
    }),
  ])
}

/** Species column definitions with the name cell linked to the species detail page. */
export function speciesColumns(campaignId: string, vocabulary?: CreatureTypeVocabulary) {
  return buildContentColumns<Species>(speciesMiddleColumns(vocabulary), {
    nameHref: (row) => ROUTES.content.species.detail(campaignId, row.id),
  })
}

export function speciesFilterSchema(vocabulary?: CreatureTypeVocabulary) {
  return buildSpeciesFilterSchema(vocabulary)
}
