import {
  compareLocationClassificationParts,
  resolveLocationClassificationDisplay,
  type Location,
} from '@rpg/contracts'
import { dataTableColumnChromeMeta, SortableHeader, type ColumnDef } from '@rpg/ui'
import { Link } from 'react-router-dom'

import { ROUTES } from '@/app/routes'
import { buildCollectionCountColumn } from '@/lib/data-table/column-builders'
import { buildContentColumns } from '../../lib/overview/content-table-config'

import { buildChildSummariesByParentId, type LocationChildSummaryItem } from './location-display'

export type { LocationsOverviewFilterState } from './locations-overview-filter-schema'
export { locationsFilterSchema } from './locations-overview-filter-schema'

function buildParentNameById(locations: readonly Location[]): Map<string, string> {
  return new Map(locations.map((location) => [location.id, location.name]))
}

function buildLocationContainsColumn(
  childSummariesByParentId: Map<string, LocationChildSummaryItem[]>,
): ColumnDef<Location> {
  return buildCollectionCountColumn({
    id: 'contains',
    label: 'Contains',
    getItems: (row) => childSummariesByParentId.get(row.id) ?? [],
    getCount: (row) => childSummariesByParentId.get(row.id)?.length ?? 0,
    singularLabel: 'location',
    pluralLabel: 'locations',
  })
}

function buildLocationMiddleColumns(
  campaignId: string,
  parentNameById: Map<string, string>,
  childSummariesByParentId: Map<string, LocationChildSummaryItem[]>,
): ColumnDef<Location>[] {
  return [
    {
      id: 'locationType',
      accessorFn: (row) => resolveLocationClassificationDisplay(row).text,
      header: ({ column }) => <SortableHeader column={column}>Type</SortableHeader>,
      cell: ({ row }) => resolveLocationClassificationDisplay(row.original).text,
      sortingFn: (left, right) => {
        const partsComparison = compareLocationClassificationParts(
          resolveLocationClassificationDisplay(left.original).parts,
          resolveLocationClassificationDisplay(right.original).parts,
        )
        if (partsComparison !== 0) return partsComparison

        return left.original.name.localeCompare(right.original.name)
      },
      filterFn: (row, _columnId, filterValue) => {
        const summary = resolveLocationClassificationDisplay(row.original).text
        return summary.toLowerCase().includes(String(filterValue).toLowerCase())
      },
      meta: { label: 'Type', ...dataTableColumnChromeMeta('medium', 'meta') },
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
    buildLocationContainsColumn(childSummariesByParentId),
  ]
}

export function locationsColumns(
  campaignId: string,
  options?: {
    locations?: readonly Location[]
  },
) {
  const locations = options?.locations ?? []
  const parentNameById = buildParentNameById(locations)
  const childSummariesByParentId = buildChildSummariesByParentId(locations)

  return buildContentColumns<Location>(
    buildLocationMiddleColumns(campaignId, parentNameById, childSummariesByParentId),
    {
      contentType: 'locations',
      nameHref: (row) => ROUTES.content.locations.detail(campaignId, row.id),
    },
  )
}
