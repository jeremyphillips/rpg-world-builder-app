import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { type SystemRulesetId } from '@rpg/contracts'
import { getStandardXpProgression } from '@rpg/catalog/xp-progressions'

import { ROUTES } from '@/app/routes'
import { PageLoadState } from '@/components/layout/page-load-state'
import { WidePage } from '@/components/layout/wide-page'
import { useCanManageCampaign } from '@/features/campaign'

import { CampaignCharacterStatusSummary } from '../../components/detail/campaign-character-status-summary.client'
import { CharacterDetailContent } from '../../components/detail/character-detail-content.client'
import { useCampaignBuildContext } from '../../hooks/use-campaign-build-context'
import { useCharacterOrganizationReferences } from '../../hooks/use-character-organization-references'
import { buildCharacterDetailViewModel } from '../../lib/display/character-display'
import { resolveQueryErrorLabel } from '../../lib/resolve-query-error-label.lib'
import { NpcStatusEditAction } from '../components/npc-status-edit-action.client'
import { useDeleteNpc } from '../hooks/use-delete-npc'
import { useNpc } from '../hooks/use-npcs'

/** Campaign NPC detail — reuses {@link CharacterDetailContent}; see its growth comment for the PC/NPC boundary. */
export function NpcDetail() {
  const navigate = useNavigate()
  const { campaignId = '', npcId } = useParams<{ campaignId: string; npcId: string }>()
  const canManage = useCanManageCampaign(campaignId)
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false)
  const deleteNpc = useDeleteNpc()
  const {
    data: npcDetail,
    isPending: isNpcPending,
    isError: isNpcError,
    error: npcError,
  } = useNpc(campaignId, npcId)
  const {
    catalogIndex,
    context,
    isPending: isContextPending,
    isError: isContextError,
    error: contextError,
  } = useCampaignBuildContext(campaignId)
  const organizationReferencesQuery = useCharacterOrganizationReferences(
    campaignId,
    npcId,
    canManage,
  )

  const viewModel = useMemo(() => {
    if (!npcDetail || !catalogIndex || !context) return null

    return buildCharacterDetailViewModel({
      character: npcDetail.character,
      catalogIndex,
      rules: context.characterCreationRules,
      xpProgression: getStandardXpProgression(npcDetail.character.rulesetId as SystemRulesetId),
      organizationReferences: organizationReferencesQuery.data,
    })
  }, [catalogIndex, context, npcDetail, organizationReferencesQuery.data])

  const isPending =
    isNpcPending || organizationReferencesQuery.isPending || Boolean(npcDetail && isContextPending)
  const isError = isNpcError || isContextError || organizationReferencesQuery.isError
  const errorLabel = resolveQueryErrorLabel([
    { isPending: isNpcPending, isError: isNpcError, error: npcError },
    { isPending: isContextPending, isError: isContextError, error: contextError },
    organizationReferencesQuery,
  ])

  const handleDelete = () => {
    if (!npcId) return

    deleteNpc.mutate(
      { campaignId, npcId },
      {
        onSuccess: () => {
          setConfirmDeleteOpen(false)
          void navigate(ROUTES.campaign.npcs.list(campaignId))
        },
      },
    )
  }

  return (
    <WidePage spacing="relaxed">
      <PageLoadState
        isPending={isPending}
        isError={isError}
        errorLabel={errorLabel}
        defaultErrorLabel="Could not load NPC."
      >
        {viewModel && npcDetail ? (
          <CharacterDetailContent
            viewModel={viewModel}
            statusSummary={
              <CampaignCharacterStatusSummary
                vital={npcDetail.character.vital}
                roster={npcDetail.participation.roster}
              />
            }
            statusActions={
              canManage ? (
                <NpcStatusEditAction
                  campaignId={campaignId}
                  npcId={npcDetail.character.id}
                  vital={npcDetail.character.vital}
                  roster={npcDetail.participation.roster}
                />
              ) : undefined
            }
            showDelete={canManage}
            deleteConfig={
              canManage
                ? {
                    open: confirmDeleteOpen,
                    onOpenChange: setConfirmDeleteOpen,
                    onConfirm: handleDelete,
                    isPending: deleteNpc.isPending,
                    headline: 'Delete NPC?',
                    description: (
                      <>
                        Permanently delete <strong>{viewModel.identity.name}</strong>? This cannot
                        be undone.
                      </>
                    ),
                  }
                : undefined
            }
          />
        ) : null}
      </PageLoadState>
    </WidePage>
  )
}
