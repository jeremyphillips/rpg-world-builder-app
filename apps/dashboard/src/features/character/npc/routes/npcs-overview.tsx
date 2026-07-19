import { Link, useParams } from 'react-router-dom'
import { DataTable, Text, buttonVariants } from '@rpg/ui'

import { ROUTES } from '@/app/routes'
import { PageLoadState } from '@/components/layout/page-load-state'
import { NarrowPage } from '@/components/layout/narrow-page'
import { PageHeader } from '@/components/layout/page-header'
import { useCanManageCampaign } from '@/features/campaign'

import { useCampaignBuildContext } from '../../hooks/use-campaign-build-context'
import { NpcAuthoringGate } from '../components/npc-authoring-gate.client'
import { useNpcs } from '../hooks/use-npcs'
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
    <Link to={ROUTES.campaign.npcs.new(campaignId)} className={buttonVariants({ size: 'sm' })}>
      Create NPC
    </Link>
  ) : undefined

  return (
    <NpcAuthoringGate campaignId={campaignId}>
      <NarrowPage spacing="list">
        <PageHeader heading="NPCs" actions={actions} />
        <PageLoadState
          isPending={isPending}
          isError={isError}
          errorLabel={contextError?.message}
          defaultErrorLabel="Could not load NPCs."
        >
          {catalogIndex ? (
            npcs.length === 0 ? (
              <Text variant="muted">{NPCS_EMPTY_MESSAGE}</Text>
            ) : (
              <DataTable
                columns={npcsOverviewColumns(campaignId, catalogIndex)}
                data={npcs}
                caption="Non-player characters in this campaign"
              />
            )
          ) : null}
        </PageLoadState>
      </NarrowPage>
    </NpcAuthoringGate>
  )
}
