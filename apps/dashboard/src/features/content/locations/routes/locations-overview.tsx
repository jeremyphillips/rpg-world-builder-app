import { useParams } from 'react-router-dom'
import type { Location, WithCampaignAccess } from '@rpg/contracts'
import type { ColumnDef } from '@rpg/ui'

import { ROUTES } from '@/app/routes'
import {
  formatContentCollectionAvailabilityCaption,
  formatContentCreateHeading,
  getContentTypeCollectionLabel,
} from '@/features/content/lib/content-type-labels'
import { ContentOverviewShell } from '../../lib/overview/content-overview-shell'
import { ContentOverviewTable } from '../../lib/overview/content-overview-table.client'
import { useLocations, useLocationsUsageMeta } from '../hooks/use-locations'
import { locationsColumns, locationsFilterSchema } from '../lib/locations-overview-columns'

export function LocationsOverview() {
  const { campaignId = '' } = useParams<{ campaignId: string }>()
  const { data: locations = [], isPending, isError } = useLocations(campaignId)
  const { data: usageMeta } = useLocationsUsageMeta(campaignId)
  const usageSummaryLabels = usageMeta?.usageSummaryLabels
  const overviewUsageScope = usageMeta?.overviewUsageScope

  return (
    <ContentOverviewShell
      heading={getContentTypeCollectionLabel('locations')}
      campaignId={campaignId}
      isPending={isPending}
      isError={isError}
      newHref={ROUTES.content.locations.create(campaignId)}
      newLabel={formatContentCreateHeading('locations')}
    >
      <ContentOverviewTable<WithCampaignAccess<Location>>
        contentTypeKey="locations"
        campaignId={campaignId}
        columns={
          locationsColumns(campaignId, {
            locations,
            usageSummaryLabels,
            overviewUsageScope,
          }) as ColumnDef<WithCampaignAccess<Location>>[]
        }
        filterSchema={locationsFilterSchema}
        data={locations as WithCampaignAccess<Location>[]}
        caption={formatContentCollectionAvailabilityCaption('locations')}
        getEditHref={(row) => ROUTES.content.locations.edit(campaignId, row.id)}
      />
    </ContentOverviewShell>
  )
}
