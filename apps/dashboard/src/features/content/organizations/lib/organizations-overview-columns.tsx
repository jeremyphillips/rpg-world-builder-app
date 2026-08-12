import {
  getOrganizationDomainLabel,
  ORGANIZATION_DOMAIN_ENTRIES,
  ORGANIZATION_DOMAIN_IDS,
  type Organization,
  type WithCampaignAccess,
} from '@rpg/contracts'
import type { ContentOverviewUsageScope, ContentUsageSummaryLabels } from '@rpg/contracts'
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
  organizationDomain?: Organization['organizationDomain']
}

const ORGANIZATION_MIDDLE_COLUMNS: ColumnDef<Organization>[] = [
  {
    accessorKey: 'organizationDomain',
    header: ({ column }) => <SortableHeader column={column}>Domain</SortableHeader>,
    cell: ({ row }) =>
      getOrganizationDomainLabel(
        row.getValue<Organization['organizationDomain']>('organizationDomain'),
      ),
    filterFn: 'equalsString',
    meta: { label: 'Domain', ...dataTableColumnChromeMeta('medium', 'meta') },
  },
]

export const organizationsFilterSchema = buildContentFilterSchema<
  OrganizationRow,
  OrganizationsOverviewFilterState
>('organizations', [
  createEqualsFilter<
    OrganizationRow,
    OrganizationsOverviewFilterState,
    'organizationDomain',
    Organization['organizationDomain']
  >({
    id: 'organizationDomain',
    label: 'Domain',
    allOptionLabel: 'All domains',
    options: ORGANIZATION_DOMAIN_IDS.map((id) => ({
      value: id,
      label: ORGANIZATION_DOMAIN_ENTRIES[id].label,
    })),
    getValue: (row) => row.organizationDomain,
  }),
])

export function organizationsColumns(
  campaignId: string,
  usage?: {
    usageSummaryLabels?: ContentUsageSummaryLabels
    overviewUsageScope?: ContentOverviewUsageScope
  },
) {
  return buildContentColumns<Organization>(ORGANIZATION_MIDDLE_COLUMNS, {
    ...usage,
    contentType: 'organizations',
    nameHref: (row) => ROUTES.content.organizations.detail(campaignId, row.id),
  })
}
