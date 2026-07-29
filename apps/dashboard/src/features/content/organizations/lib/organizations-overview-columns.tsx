import {
  getOrganizationKindLabel,
  ORGANIZATION_KIND_ENTRIES,
  ORGANIZATION_KIND_IDS,
  type Organization,
  type WithCampaignAccess,
} from '@rpg/contracts'
import { dataTableColumnChromeMeta, SortableHeader, type ColumnDef } from '@rpg/ui'
import { createEqualsFilter } from '@rpg/ui/filters'

import { ROUTES } from '@/app/routes'
import {
  buildContentFilterSchema,
  type ContentOverviewBaseFilterState,
} from '../../lib/overview/content-overview-filter-schema'
import { buildContentColumns } from '../../lib/overview/content-table-config'

type OrganizationRow = WithCampaignAccess<Organization>

export type OrganizationsOverviewFilterState = ContentOverviewBaseFilterState & {
  organizationKind?: Organization['organizationKind']
}

const ORGANIZATION_MIDDLE_COLUMNS: ColumnDef<Organization>[] = [
  {
    accessorKey: 'organizationKind',
    header: ({ column }) => <SortableHeader column={column}>Type</SortableHeader>,
    cell: ({ row }) =>
      getOrganizationKindLabel(row.getValue<Organization['organizationKind']>('organizationKind')),
    filterFn: 'equalsString',
    meta: { label: 'Type', ...dataTableColumnChromeMeta('medium', 'meta') },
  },
]

export const organizationsFilterSchema = buildContentFilterSchema<
  OrganizationRow,
  OrganizationsOverviewFilterState
>('organizations', [
  createEqualsFilter<
    OrganizationRow,
    OrganizationsOverviewFilterState,
    'organizationKind',
    Organization['organizationKind']
  >({
    id: 'organizationKind',
    label: 'Type',
    allOptionLabel: 'All types',
    options: ORGANIZATION_KIND_IDS.map((id) => ({
      value: id,
      label: ORGANIZATION_KIND_ENTRIES[id].label,
    })),
    getValue: (row) => row.organizationKind,
  }),
])

export function organizationsColumns(campaignId: string) {
  return buildContentColumns<Organization>(ORGANIZATION_MIDDLE_COLUMNS, {
    contentType: 'organizations',
    nameHref: (row) => ROUTES.content.organizations.detail(campaignId, row.id),
  })
}
