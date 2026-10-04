import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { buttonVariants } from '@rpg/ui'

import { ROUTES } from '@/app/routes'
import { OverviewPageShell } from '@/components/layout/page/overview-page-shell'
import { ContentCreateSplitAction } from '@/lib/create-flow'
import { useCanManageCampaign } from '@/features/campaign'

import { NpcsOverviewTable } from '../components/npcs-overview-table'
import { QuickNpcCreateModal } from '../components/quick-npc/quick-npc-create-modal'
import { buildCharacterBuilderDraftFromQuickNpcSetup } from '../lib/quick-npc/build-character-builder-draft-from-quick-npc-setup.lib'
import { useCampaignBuildContext } from '../../hooks/use-campaign-build-context'
import { resolveQueryErrorLabel } from '@/lib/query/query-state.lib'
import { useNpcs } from '../hooks/use-npcs'
import {
  formatCharacterTypeCreatePrimaryLabel,
  formatCharacterTypeImportActionLabel,
  formatCharacterTypeLoadErrorMessage,
  getCharacterTypeItemLabel,
  getCharacterTypeNavLabel,
} from '../../lib/display/character-type-labels'

export function NpcsOverview() {
  const { campaignId = '' } = useParams<{ campaignId: string }>()
  const navigate = useNavigate()
  const canManage = useCanManageCampaign(campaignId)
  const [modalMode, setModalMode] = useState<'handoff' | 'authoring' | null>(null)
  const {
    data: npcs = [],
    isPending: isNpcsPending,
    isError: isNpcsError,
    error: npcsError,
  } = useNpcs(campaignId)
  const {
    context,
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
        {formatCharacterTypeImportActionLabel('npc')}
      </Link>
      {context ? (
        <>
          <QuickNpcCreateModal
            open={modalMode != null}
            onOpenChange={(open) => {
              if (!open) setModalMode(null)
            }}
            campaignId={campaignId}
            buildContext={context}
            context={{ kind: 'standalone' }}
            onCancel={() => setModalMode(null)}
            setupCompletion={modalMode === 'handoff' ? 'handoff' : 'authoring'}
            onSetupHandoff={(setup) => {
              navigate(ROUTES.campaign.npcs.new(campaignId), {
                state: {
                  builderSeed: buildCharacterBuilderDraftFromQuickNpcSetup(setup),
                },
              })
            }}
          />
          <ContentCreateSplitAction
            entityLabel={getCharacterTypeItemLabel('npc')}
            primaryLabel={formatCharacterTypeCreatePrimaryLabel('npc')}
            onCreateFromScratch={() => navigate(ROUTES.campaign.npcs.new(campaignId))}
            onStartWithSetup={() => setModalMode('handoff')}
            onQuickCreate={() => setModalMode('authoring')}
          />
        </>
      ) : null}
    </div>
  ) : undefined

  return (
    <OverviewPageShell
      heading={getCharacterTypeNavLabel('npc')}
      isPending={isPending}
      isError={isError}
      errorLabel={errorLabel}
      defaultErrorLabel={formatCharacterTypeLoadErrorMessage('npc')}
      actions={actions}
    >
      {catalogIndex ? (
        <NpcsOverviewTable campaignId={campaignId} catalogIndex={catalogIndex} npcs={npcs} />
      ) : null}
    </OverviewPageShell>
  )
}
