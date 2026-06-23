import { useParams } from 'react-router-dom'
import { DataTable } from '@rpg/ui'
import type { Feat } from '@rpg/contracts'

import { ROUTES } from '@/app/routes'
import { useFeats } from '../hooks/use-feats'
import { featsColumns, featsFilters } from '../components/feats-columns'
import { ContentOverviewShell } from '../../lib/content-overview-shell'
import { ContentOverviewRowActions } from '../../lib/content-overview-row-actions'

function FeatRowActions({ row, campaignId }: { row: Feat; campaignId: string }) {
  return (
    <ContentOverviewRowActions
      campaignId={campaignId}
      editHref={ROUTES.content.feats.edit(campaignId, row.id)}
      enabled={true}
      onToggleEnabled={() => {}}
      itemLabel="feat"
    />
  )
}

export function FeatsOverview() {
  const { campaignId = '' } = useParams<{ campaignId: string }>()
  const { data: feats = [], isPending, isError } = useFeats(campaignId)

  return (
    <ContentOverviewShell
      heading="Feats"
      campaignId={campaignId}
      isPending={isPending}
      isError={isError}
      newHref={ROUTES.content.feats.create(campaignId)}
      newLabel="New Feat"
    >
      <DataTable
        columns={featsColumns(campaignId)}
        data={feats}
        filters={featsFilters}
        rowActions={(row) => <FeatRowActions row={row} campaignId={campaignId} />}
        caption="Feats available in this campaign"
      />
    </ContentOverviewShell>
  )
}
