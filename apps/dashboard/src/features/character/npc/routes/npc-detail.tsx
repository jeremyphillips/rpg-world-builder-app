import { PageLoadState } from '@/components/layout/page-load-state'
import { WidePage } from '@/components/layout/wide-page'

import { CampaignCharacterStatusSummary } from '../../components/detail/campaign-character-status-summary.client'
import { CharacterDetailContent } from '../../components/detail/character-detail-content.client'
import { CharacterOrganizationsSummary } from '../../components/detail/character-organizations-summary.client'
import { NpcStatusEditAction } from '../components/npc-status-edit-action.client'
import { useNpcDetailPage } from '../hooks/use-npc-detail-page.client'

/** Campaign NPC detail — reuses {@link CharacterDetailContent}; see its growth comment for the PC/NPC boundary. */
export function NpcDetail() {
  const {
    campaignId,
    canManage,
    deleteFlow,
    errorLabel,
    isError,
    isPending,
    npcDetail,
    organizationReferences,
    viewModel,
  } = useNpcDetailPage()

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
            identitySupplement={
              organizationReferences ? (
                <CharacterOrganizationsSummary
                  campaignId={campaignId}
                  organizationReferences={organizationReferences}
                />
              ) : null
            }
            showDelete={canManage}
            deleteConfig={canManage ? deleteFlow.deleteConfig : undefined}
          />
        ) : null}
      </PageLoadState>

      {viewModel ? deleteFlow.blockedDialog : null}
    </WidePage>
  )
}
