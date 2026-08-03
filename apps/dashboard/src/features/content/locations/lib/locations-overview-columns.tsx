import {
  getLocationKindLabel,
  LOCATION_KIND_ENTRIES,
  LOCATION_KIND_IDS,
  type Location,
  type WithCampaignAccess,
} from '@rpg/contracts'
import type { ContentOverviewUsageScope, ContentUsageSummaryLabels } from '@rpg/contracts'
import { dataTableColumnChromeMeta, SortableHeader, type ColumnDef } from '@rpg/ui'
import { Link } from 'react-router-dom'
import { createEqualsFilter } from '@rpg/ui/filters'

import { ROUTES } from '@/app/routes'
import {
  buildContentFilterSchema,
  type ContentOverviewBaseFilterState,
} from '../../lib/overview/content-overview-filter-schema'
import { buildContentColumns } from '../../lib/overview/content-table-config'

type LocationRow = WithCampaignAccess<Location>

export type LocationsOverviewFilterState = ContentOverviewBaseFilterState & {
  kind?: Location['kind']
}

function buildParentNameById(locations: readonly Location[]): Map<string, string> {
  return new Map(locations.map((location) => [location.id, location.name]))
}

export const locationsFilterSchema = buildContentFilterSchema<
  LocationRow,
  LocationsOverviewFilterState
>('locations', [
  createEqualsFilter<LocationRow, LocationsOverviewFilterState, 'kind', Location['kind']>({
    id: 'kind',
    label: 'Kind',
    allOptionLabel: 'All kinds',
    options: LOCATION_KIND_IDS.map((id) => ({
      value: id,
      label: LOCATION_KIND_ENTRIES[id].label,
    })),
    getValue: (row) => row.kind,
  }),
])

function buildLocationMiddleColumns(
  campaignId: string,
  parentNameById: Map<string, string>,
): ColumnDef<Location>[] {
  return [
    {
      accessorKey: 'kind',
      header: ({ column }) => <SortableHeader column={column}>Kind</SortableHeader>,
      cell: ({ row }) => getLocationKindLabel(row.getValue<Location['kind']>('kind')),
      filterFn: 'equalsString',
      meta: { label: 'Kind', ...dataTableColumnChromeMeta('medium', 'meta') },
    },
    {
      id: 'parentLocation',
      accessorFn: (row) => row.parentLocationId,
      header: 'Parent',
      cell: ({ row }) => {
        const parentLocationId = row.original.parentLocationId
        if (!parentLocationId) return '—'

        const parentName = parentNameById.get(parentLocationId)
        if (!parentName) return '—'

        return (
          <Link
            to={ROUTES.content.locations.detail(campaignId, parentLocationId)}
            className="text-link hover:underline"
          >
            {parentName}
          </Link>
        )
      },
      meta: { label: 'Parent', ...dataTableColumnChromeMeta('medium', 'meta') },
    },
  ]
}

export function locationsColumns(
  campaignId: string,
  options?: {
    locations?: readonly Location[]
    usageSummaryLabels?: ContentUsageSummaryLabels
    overviewUsageScope?: ContentOverviewUsageScope
  },
) {
  const parentNameById = buildParentNameById(options?.locations ?? [])

  return buildContentColumns<Location>(buildLocationMiddleColumns(campaignId, parentNameById), {
    ...options,
    contentType: 'locations',
    nameHref: (row) => ROUTES.content.locations.detail(campaignId, row.id),
  })
}
