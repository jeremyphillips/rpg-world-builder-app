import { useParams } from 'react-router-dom'
import type { Feat, WithCampaignAccess } from '@rpg/contracts'
import type { ColumnDef } from '@rpg/ui'

import { ROUTES } from '@/app/routes'
import {
  formatContentCollectionAvailabilityCaption,
  formatContentCreateHeading,
  getContentTypeCollectionLabel,
} from '@/features/content/lib/content-type-labels'
import { useFeats } from '../hooks/use-feats'
import { featsColumns, featsFilterSchema } from '../lib/feats-overview-columns'
import { ContentOverviewShell } from '../../lib/overview/content-overview-shell'
import { ContentOverviewTable } from '../../lib/overview/content-overview-table.client'

export function FeatsOverview() {
  const { campaignId = '' } = useParams<{ campaignId: string }>()
  const { data: feats = [], isPending, isError } = useFeats(campaignId)

  return (
    <ContentOverviewShell
      heading={getContentTypeCollectionLabel('feats')}
      campaignId={campaignId}
      isPending={isPending}
      isError={isError}
      newHref={ROUTES.content.feats.create(campaignId)}
      newLabel={formatContentCreateHeading('feats')}
    >
      <ContentOverviewTable<WithCampaignAccess<Feat>>
        contentTypeKey="feats"
        campaignId={campaignId}
        columns={featsColumns(campaignId) as ColumnDef<WithCampaignAccess<Feat>, unknown>[]}
        filterSchema={featsFilterSchema}
        data={feats as WithCampaignAccess<Feat>[]}
        caption={formatContentCollectionAvailabilityCaption('feats')}
        getEditHref={(row) => ROUTES.content.feats.edit(campaignId, row.id)}
      />
    </ContentOverviewShell>
  )
}
