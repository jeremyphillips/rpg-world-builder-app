'use client'

import { useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { Text } from '@rpg/ui'
import { useFilterState } from '@rpg/ui/filters'

import { PageHeader } from '@/components/layout/page-header'
import { WidePage } from '@/components/layout/wide-page'
import { CatalogOverviewTable } from '@/lib/data-table/catalog-overview-table.client'
import { PrimaryFilterBarRegion } from '@/lib/data-table/primary-filter-bar-region.client'

import { AdminUserContextLine } from '../components/admin-user-tab-nav.client'
import { useAdminUserCampaigns } from '../hooks/use-admin-user-campaigns'
import { adminUserCampaignsColumns } from '../lib/admin-user-campaigns-columns'
import {
  adminUserCampaignsFilterSchema,
  toAdminUserCampaignsListQuery,
} from '../lib/admin-user-campaigns-filter-schema'

const ADMIN_USER_CAMPAIGNS_TABLE_KEY = 'admin-user-campaigns'

export function AdminUserCampaignsTable() {
  const { userId } = useParams<{ userId: string }>()
  const filterSchema = useMemo(() => adminUserCampaignsFilterSchema(), [])
  const { state: filterState, setValue, reset } = useFilterState(filterSchema)
  const listQuery = useMemo(() => toAdminUserCampaignsListQuery(filterState), [filterState])

  const { data: campaigns = [], isPending, isError } = useAdminUserCampaigns(userId!, listQuery)
  const tableRows = useMemo(
    () => campaigns.map((row) => ({ ...row, id: row.campaign.id })),
    [campaigns],
  )

  const filterRegion = (
    <PrimaryFilterBarRegion
      filterSchema={filterSchema}
      filterState={filterState}
      onValueChange={setValue}
      onReset={reset}
    />
  )

  if (isError) {
    return <Text variant="muted">Could not load campaigns.</Text>
  }

  return (
    <CatalogOverviewTable
      tableKey={ADMIN_USER_CAMPAIGNS_TABLE_KEY}
      columns={adminUserCampaignsColumns()}
      data={tableRows}
      caption="User campaigns"
      filters={filterRegion}
      resultCountLabel={`${campaigns.length} campaign${campaigns.length === 1 ? '' : 's'}`}
      emptyState={
        isPending
          ? 'Loading campaigns…'
          : 'No campaign relationships. This user does not own, co-own, or belong to any campaigns.'
      }
    />
  )
}

export function AdminUserCampaignsPage() {
  return (
    <WidePage spacing="list">
      <PageHeader heading="Campaigns" />
      <Text variant="muted">Campaigns this user owns, co-owns, or has joined.</Text>
      <AdminUserContextLine />
      <AdminUserCampaignsTable />
    </WidePage>
  )
}
