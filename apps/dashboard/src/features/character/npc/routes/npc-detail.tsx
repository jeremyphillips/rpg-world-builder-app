import { PageLoadState } from '@/components/layout/page/page-load-state'
import { WidePage } from '@/components/layout/page/wide-page'

import { CampaignCharacterStatusSummary } from '../../components/detail/status/campaign-character-status-summary'
import { CharacterDetailContent } from '../../components/detail/character-detail-content'
import { CharacterOrganizationMembershipsContainer } from '../../components/detail/memberships/character-organization-memberships-container'
import { NpcStatusEditAction } from '../components/npc-status-edit-action'
import { useNpcDetailPage } from '../hooks/use-npc-detail-page'

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
