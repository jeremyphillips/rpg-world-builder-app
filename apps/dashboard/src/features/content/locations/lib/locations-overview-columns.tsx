import { getLocationKindLabel, type Location } from '@rpg/contracts'
import type { ContentOverviewUsageScope, ContentUsageSummaryLabels } from '@rpg/contracts'
import { dataTableColumnChromeMeta, SortableHeader, type ColumnDef } from '@rpg/ui'
import { Link } from 'react-router-dom'

import { ROUTES } from '@/app/routes'
import { buildContentColumns } from '../../lib/overview/content-table-config'

export type { LocationsOverviewFilterState } from './locations-overview-filter-schema'
export { locationsFilterSchema } from './locations-overview-filter-schema'

function buildParentNameById(locations: readonly Location[]): Map<string, string> {
  return new Map(locations.map((location) => [location.id, location.name]))
}

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
