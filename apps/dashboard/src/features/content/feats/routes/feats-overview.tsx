import { useParams } from 'react-router-dom'
import { DataTable } from '@rpg/ui'
import type { Feat } from '@rpg/contracts'

import { ROUTES } from '@/app/routes'
import {
  formatContentCollectionAvailabilityCaption,
  formatContentCreateHeading,
  getContentTypeCollectionLabel,
  getContentTypeMidSentenceLabel,
} from '@/features/content/lib/content-type-labels'
import { useFeats } from '../hooks/use-feats'
import { featsColumns, featsFilters } from '../lib/feats-overview-columns'
import { ContentOverviewShell } from '../../lib/overview/content-overview-shell'
import { ContentOverviewRowActions } from '../../lib/overview/content-overview-row-actions'

function FeatRowActions({ row, campaignId }: { row: Feat; campaignId: string }) {
  return (
    <ContentOverviewRowActions
      campaignId={campaignId}
      editHref={ROUTES.content.feats.edit(campaignId, row.id)}
      enabled={true}
      onToggleEnabled={() => {}}
      itemLabel={getContentTypeMidSentenceLabel('feats')}
    />
  )
}

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
      <DataTable
        columns={featsColumns(campaignId)}
        data={feats}
        filters={featsFilters}
        rowActions={(row) => <FeatRowActions row={row} campaignId={campaignId} />}
        caption={formatContentCollectionAvailabilityCaption('feats')}
      />
    </ContentOverviewShell>
  )
}
