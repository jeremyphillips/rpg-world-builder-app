import { useParams } from 'react-router-dom'
import type { Monster, WithCampaignAccess } from '@rpg/contracts'
import type { ColumnDef } from '@rpg/ui'

import {
  formatContentOverviewCaption,
  getContentTypeCollectionLabel,
} from '@/features/content/lib/content-type-labels'
import { ContentOverviewShell } from '../../lib/overview/content-overview-shell'
import { ContentOverviewTable } from '../../lib/overview/content-overview-table'
import { useMonsters } from '../hooks/use-monsters'
import { monstersColumns, monstersFilterSchema } from '../lib/monsters-overview-columns'

export function MonstersOverview() {
  const { campaignId = '' } = useParams<{ campaignId: string }>()
  const { data: monsters = [], isPending, isError } = useMonsters(campaignId)
  return (
    <ContentOverviewShell
      heading={getContentTypeCollectionLabel('monsters')}
      campaignId={campaignId}
      isPending={isPending}
      isError={isError}
    >
      <ContentOverviewTable<WithCampaignAccess<Monster>>
        contentTypeKey="monsters"
        campaignId={campaignId}
        readOnly
        columns={monstersColumns(campaignId) as ColumnDef<WithCampaignAccess<Monster>, unknown>[]}
        filterSchema={monstersFilterSchema}
        data={monsters as WithCampaignAccess<Monster>[]}
        caption={formatContentOverviewCaption('monsters', 'Combat')}
      />
    </ContentOverviewShell>
  )
}
