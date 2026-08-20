import { useParams } from 'react-router-dom'
import type { Location, WithCampaignAccess } from '@rpg/contracts'
import type { ColumnDef } from '@rpg/ui'

import { ROUTES } from '@/app/routes'
import {
  formatContentCollectionAvailabilityCaption,
  getContentTypeCollectionLabel,
} from '@/features/content/lib/content-type-labels'
import { ContentOverviewShell } from '../../lib/overview/content-overview-shell'
import { ContentOverviewTable } from '../../lib/overview/content-overview-table.client'
import { LocationCreateActions } from '../components/location-create-actions.client'
import { BulkChangeParentLocationDialog } from '../components/bulk-change-parent-location-dialog.client'
import { useLocations } from '../hooks/use-locations'
import { BULK_CHANGE_PARENT_MENU_LABEL } from '../lib/hierarchy/bulk/bulk-change-parent-labels'
import { locationsColumns, locationsFilterSchema } from '../lib/overview/locations-overview-columns'

export function LocationsOverview() {
  const { campaignId = '' } = useParams<{ campaignId: string }>()
  const { data: locations = [], isPending, isError } = useLocations(campaignId)

  return (
    <ContentOverviewShell
      heading={getContentTypeCollectionLabel('locations')}
      campaignId={campaignId}
      isPending={isPending}
      isError={isError}
      actions={<LocationCreateActions campaignId={campaignId} />}
    >
      <ContentOverviewTable<WithCampaignAccess<Location>>
        contentTypeKey="locations"
        campaignId={campaignId}
        columns={
          locationsColumns(campaignId, {
            locations,
          }) as ColumnDef<WithCampaignAccess<Location>>[]
        }
        filterSchema={locationsFilterSchema}
        data={locations as WithCampaignAccess<Location>[]}
        caption={formatContentCollectionAvailabilityCaption('locations')}
        getEditHref={(row) => ROUTES.content.locations.edit(campaignId, row.id)}
        bulkExtensions={[
          {
            menuAction: {
              id: 'change-parent',
              label: BULK_CHANGE_PARENT_MENU_LABEL,
              onSelect: () => undefined,
            },
            renderDialog: (ctx) => (
              <BulkChangeParentLocationDialog
                open={ctx.open}
                onOpenChange={ctx.onOpenChange}
                campaignId={ctx.campaignId}
                selectedRows={ctx.selectedRows}
                campaignLocations={ctx.campaignRows}
                onApplyComplete={ctx.onApplyComplete}
              />
            ),
          },
        ]}
      />
    </ContentOverviewShell>
  )
}
