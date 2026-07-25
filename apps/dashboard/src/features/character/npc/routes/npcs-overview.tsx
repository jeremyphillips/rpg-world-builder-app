import { Link, useParams } from 'react-router-dom'
import { Text, buttonVariants } from '@rpg/ui'

import { ROUTES } from '@/app/routes'
import { PageLoadState } from '@/components/layout/page-load-state'
import { WidePage } from '@/components/layout/wide-page'
import { PageHeader } from '@/components/layout/page-header'
import { useCanManageCampaign } from '@/features/campaign'
import { CatalogOverviewTable } from '@/lib/data-table/catalog-overview-table.client'

import { useCampaignBuildContext } from '../../hooks/use-campaign-build-context'
import { useNpcs } from '../hooks/use-npcs'
import { npcOverviewFilterSchema } from '../lib/npc-overview-filter-schema'
import { NPC_OVERVIEW_TABLE_KEY } from '../lib/npc-overview-labels'
import { npcsOverviewColumns } from '../lib/npcs-overview-columns'

const NPCS_EMPTY_MESSAGE = 'No NPCs yet. Create one to populate your campaign roster.'

export function NpcsOverview() {
  const { campaignId = '' } = useParams<{ campaignId: string }>()
  const canManage = useCanManageCampaign(campaignId)
  const { data: npcs = [], isPending: isNpcsPending, isError: isNpcsError } = useNpcs(campaignId)
  const {
    catalogIndex,
    isPending: isContextPending,
    isError: isContextError,
    error: contextError,
  } = useCampaignBuildContext(campaignId)

  const isPending = isNpcsPending || isContextPending
  const isError = isNpcsError || isContextError
  const actions = canManage ? (
    <div className="flex flex-wrap gap-2">
      <Link
        to={ROUTES.campaign.npcs.import(campaignId)}
        className={buttonVariants({ size: 'sm', variant: 'outline' })}
      >
        Import NPC
      </Link>
      <Link to={ROUTES.campaign.npcs.new(campaignId)} className={buttonVariants({ size: 'sm' })}>
        Create NPC
      </Link>
    </div>
  ) : undefined

  return (
    <WidePage spacing="list">
      <PageHeader heading="NPCs" actions={actions} />
      <PageLoadState
        isPending={isPending}
        isError={isError}
        errorLabel={contextError?.message}
        defaultErrorLabel="Could not load NPCs."
      >
        {catalogIndex ? (
          <CatalogOverviewTable
            tableKey={NPC_OVERVIEW_TABLE_KEY}
            columns={npcsOverviewColumns(campaignId, catalogIndex)}
            data={npcs}
            filterSchema={npcOverviewFilterSchema(catalogIndex)}
            caption="Non-player characters in this campaign"
            emptyState={<Text variant="muted">{NPCS_EMPTY_MESSAGE}</Text>}
          />
        ) : null}
      </PageLoadState>
    </WidePage>
  )
}
