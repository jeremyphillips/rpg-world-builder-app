import { useMemo } from 'react'
import { useParams } from 'react-router-dom'
import type { Monster, WithCampaignAccess } from '@rpg/contracts'
import type { ColumnDef } from '@rpg/ui'

import { ROUTES } from '@/app/routes'
import {
  formatContentOverviewCaption,
  formatContentCreateHeading,
  getContentTypeCollectionLabel,
} from '@/features/content/lib/content-type-labels'
import { ContentOverviewShell } from '../../lib/overview/content-overview-shell'
import { ContentOverviewTable } from '../../lib/overview/content-overview-table'
import { mergeContentListOverviewRows } from '../../lib/list/create-content-list'
import { useMonstersListResult } from '../hooks/use-monsters'
import { monstersColumns, monstersFilterSchema } from '../lib/monsters-overview-columns'

export function MonstersOverview() {
  const { campaignId = '' } = useParams<{ campaignId: string }>()
  const { data: listResult, isPending, isError } = useMonstersListResult(campaignId)
  const monsters = useMemo(
    () =>
      mergeContentListOverviewRows(
        listResult?.items ?? [],
        listResult?.overlayFailures,
      ) as WithCampaignAccess<Monster>[],
    [listResult],
  )
  return (
    <ContentOverviewShell
      heading={getContentTypeCollectionLabel('monsters')}
      campaignId={campaignId}
      isPending={isPending}
      isError={isError}
      newHref={ROUTES.content.monsters.create(campaignId)}
      newLabel={formatContentCreateHeading('monsters')}
    >
      <ContentOverviewTable<WithCampaignAccess<Monster>>
        contentTypeKey="monsters"
        campaignId={campaignId}
        columns={monstersColumns(campaignId) as ColumnDef<WithCampaignAccess<Monster>, unknown>[]}
        filterSchema={monstersFilterSchema}
        data={monsters as WithCampaignAccess<Monster>[]}
        caption={formatContentOverviewCaption('monsters', 'Combat')}
        getEditHref={(row) => ROUTES.content.monsters.edit(campaignId, row.id)}
      />
    </ContentOverviewShell>
  )
}
