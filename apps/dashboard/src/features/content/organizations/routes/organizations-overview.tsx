import { useParams } from 'react-router-dom'
import type { Organization, WithCampaignAccess } from '@rpg/contracts'
import type { ColumnDef } from '@rpg/ui'

import { ROUTES } from '@/app/routes'
import {
  formatContentCollectionAvailabilityCaption,
  formatContentCreateHeading,
  getContentTypeCollectionLabel,
} from '@/features/content/lib/content-type-labels'
import { ContentOverviewShell } from '../../lib/overview/content-overview-shell'
import { ContentOverviewTable } from '../../lib/overview/content-overview-table'
import { useOrganizations, useOrganizationsUsageMeta } from '../hooks/use-organizations'
import {
  organizationsColumns,
  organizationsFilterSchema,
} from '../lib/organizations-overview-columns'

export function OrganizationsOverview() {
  const { campaignId = '' } = useParams<{ campaignId: string }>()
  const { data: organizations = [], isPending, isError } = useOrganizations(campaignId)
  const { data: usageMeta } = useOrganizationsUsageMeta(campaignId)
  const usageSummaryLabels = usageMeta?.usageSummaryLabels
  const overviewUsageScope = usageMeta?.overviewUsageScope

  return (
    <ContentOverviewShell
      heading={getContentTypeCollectionLabel('organizations')}
      campaignId={campaignId}
      isPending={isPending}
      isError={isError}
      newHref={ROUTES.content.organizations.create(campaignId)}
      newLabel={formatContentCreateHeading('organizations')}
    >
      <ContentOverviewTable<WithCampaignAccess<Organization>>
        contentTypeKey="organizations"
        campaignId={campaignId}
        columns={
          organizationsColumns(campaignId, { usageSummaryLabels, overviewUsageScope }) as ColumnDef<
            WithCampaignAccess<Organization>,
            unknown
          >[]
        }
        filterSchema={organizationsFilterSchema}
        data={organizations as WithCampaignAccess<Organization>[]}
        caption={formatContentCollectionAvailabilityCaption('organizations')}
        getEditHref={(row) => ROUTES.content.organizations.edit(campaignId, row.id)}
      />
    </ContentOverviewShell>
  )
}
