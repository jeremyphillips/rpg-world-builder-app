import { Link, useParams } from 'react-router-dom'
import { buttonVariants } from '@rpg/ui'

import { ROUTES } from '@/app/routes'
import { OverviewPageShell } from '@/components/layout/page/overview-page-shell'
import { useCanManageCampaign } from '@/features/campaign'

import { NpcsOverviewTable } from '../components/npcs-overview-table.client'
import { useCampaignBuildContext } from '../../hooks/use-campaign-build-context'
import { resolveQueryErrorLabel } from '@/lib/query/query-state.lib'
import { useNpcs } from '../hooks/use-npcs'

export function NpcsOverview() {
  const { campaignId = '' } = useParams<{ campaignId: string }>()
  const canManage = useCanManageCampaign(campaignId)
  const {
    data: npcs = [],
    isPending: isNpcsPending,
    isError: isNpcsError,
    error: npcsError,
  } = useNpcs(campaignId)
  const {
    catalogIndex,
    isPending: isContextPending,
    isError: isContextError,
    error: contextError,
  } = useCampaignBuildContext(campaignId)

  const isPending = isNpcsPending || isContextPending
  const isError = isNpcsError || isContextError
  const errorLabel = resolveQueryErrorLabel([
    { isPending: isNpcsPending, isError: isNpcsError, error: npcsError },
    { isPending: isContextPending, isError: isContextError, error: contextError },
  ])
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
    <OverviewPageShell
      heading="NPCs"
      isPending={isPending}
      isError={isError}
      errorLabel={errorLabel}
      defaultErrorLabel="Could not load NPCs."
      actions={actions}
    >
      {catalogIndex ? (
        <NpcsOverviewTable campaignId={campaignId} catalogIndex={catalogIndex} npcs={npcs} />
      ) : null}
    </OverviewPageShell>
  )
}
