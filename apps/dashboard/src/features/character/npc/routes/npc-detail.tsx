import { PageLoadState } from '@/components/layout/page-load-state'
import { WidePage } from '@/components/layout/wide-page'

import { CampaignCharacterStatusSummary } from '../../components/detail/campaign-character-status-summary.client'
import { CharacterDetailContent } from '../../components/detail/character-detail-content.client'
import { CharacterOrganizationMembershipsContainer } from '../../components/detail/character-organization-memberships-container.client'
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
              <CharacterOrganizationMembershipsContainer
                campaignId={campaignId}
                characterId={npcDetail.character.id}
                characterName={viewModel.identity.name}
                canEdit={canManage}
                subjectKind="npc"
              />
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
