import { useParams } from 'react-router-dom'
import type { Feat, WithCampaignAccess } from '@rpg/contracts'
import type { ColumnDef } from '@rpg/ui'

import { ROUTES } from '@/app/routes'
import {
  formatContentCollectionAvailabilityCaption,
  formatContentCreateHeading,
  getContentTypeCollectionLabel,
} from '@/features/content/lib/content-type-labels'
import { useFeats, useFeatsUsageMeta } from '../hooks/use-feats'
import { featsColumns, featsFilterSchema } from '../lib/feats-overview-columns'
import { ContentOverviewShell } from '../../lib/overview/content-overview-shell'
import { ContentOverviewTable } from '../../lib/overview/content-overview-table'

export function FeatsOverview() {
  const { campaignId = '' } = useParams<{ campaignId: string }>()
  const { data: feats = [], isPending, isError } = useFeats(campaignId)
  const { data: usageMeta } = useFeatsUsageMeta(campaignId)
  const usageSummaryLabels = usageMeta?.usageSummaryLabels
  const overviewUsageScope = usageMeta?.overviewUsageScope

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
        columns={
          featsColumns(campaignId, { usageSummaryLabels, overviewUsageScope }) as ColumnDef<
            WithCampaignAccess<Feat>,
            unknown
          >[]
        }
        filterSchema={featsFilterSchema}
        data={feats as WithCampaignAccess<Feat>[]}
        caption={formatContentCollectionAvailabilityCaption('feats')}
        getEditHref={(row) => ROUTES.content.feats.edit(campaignId, row.id)}
      />
    </ContentOverviewShell>
  )
}
