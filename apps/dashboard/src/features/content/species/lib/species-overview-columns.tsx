import type { Species, WithCampaignAccess } from '@rpg/contracts'
import { formatMovementDisplay, getCreatureSizeLabel } from '@rpg/contracts'
import { dataTableWidthMeta, SortableHeader } from '@rpg/ui'
import type { ColumnDef } from '@rpg/ui'

import { ROUTES } from '@/app/routes'
import { buildCollectionCountColumn } from '@/lib/data-table/column-builders'

import { buildContentColumns } from '../../lib/overview/content-table-config'
import {
  buildContentFilterSchema,
  type ContentOverviewBaseFilterState,
} from '../../lib/overview/content-overview-filter-schema'
import { SPECIES_SECTION_LABELS } from './species-display'
import { resolveSpeciesTraitSummaryItems } from './species-overview-summary-items'

type SpeciesRow = WithCampaignAccess<Species>

export type SpeciesOverviewFilterState = ContentOverviewBaseFilterState

const SPECIES_COLLECTION_LABELS = {
  traits: { singular: 'trait', plural: 'traits', column: SPECIES_SECTION_LABELS.traits },
} as const

function speciesMiddleColumns(): ColumnDef<Species>[] {
  return [
    buildCollectionCountColumn<Species>({
      id: 'traits',
      label: SPECIES_COLLECTION_LABELS.traits.column,
      getItems: resolveSpeciesTraitSummaryItems,
      getCount: (row) => row.traits.length,
      singularLabel: SPECIES_COLLECTION_LABELS.traits.singular,
      pluralLabel: SPECIES_COLLECTION_LABELS.traits.plural,
    }),
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

const emptySpeciesFilterSchema = buildContentFilterSchema<SpeciesRow, SpeciesOverviewFilterState>(
  'species',
  [],
)

/** Species column definitions with the name cell linked to the species detail page. */
export function speciesColumns(campaignId: string) {
  return buildContentColumns<Species>(speciesMiddleColumns(), {
    contentType: 'species',
    nameHref: (row) => ROUTES.content.species.detail(campaignId, row.id),
  })
}

export function speciesFilterSchema() {
  return emptySpeciesFilterSchema
}
