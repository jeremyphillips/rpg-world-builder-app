import {
  CampaignCharacterStatusSummary,
  CampaignParticipatingCharacterStatusEditAction,
  CharacterDetailContent,
  CharacterDetailRouteMedia,
  CharacterIdentityConnectionsSupplement,
  toCampaignParticipatingCharacterStatusPatch,
} from '@/features/character'
import type { CampaignCharacterGetResponse } from '@rpg/contracts'

import { resolveCampaignCharacterDetailAccess } from '../lib/characters/campaign-character-detail-access.lib'
import type { useCampaignCharacterDetail } from '../hooks/use-campaign-character-detail'
import { useUpdateCampaignCharacterStatus } from '../hooks/use-update-campaign-character-status'

type DetailResult = ReturnType<typeof useCampaignCharacterDetail>

export type CampaignCharacterDetailBodyProps = {
  campaignId: string
  characterId: string
  viewerId?: string
  detail: DetailResult & {
    viewModel: NonNullable<DetailResult['viewModel']>
    campaignCharacter: CampaignCharacterGetResponse
  }
}

export function CampaignCharacterDetailBody({
  campaignId,
  characterId,
  viewerId,
  detail,
}: CampaignCharacterDetailBodyProps) {
  const character = detail.campaignCharacter.character
  const { canManage, canEditMedia, managerWrite } = resolveCampaignCharacterDetailAccess({
    viewerId,
    characterUserId: character.userId,
    canManage: detail.campaignCharacter.capabilities.canManage,
    campaignId,
  })
  const updateStatus = useUpdateCampaignCharacterStatus(campaignId, characterId)

  return (
    <CharacterDetailContent
      viewModel={detail.viewModel}
      identityMedia={
        <CharacterDetailRouteMedia
          characterType="pc"
          characterId={character.id}
          userId={character.userId}
          campaignId={campaignId}
          media={character.media}
          canEditMedia={canEditMedia}
          pcMediaScopeKind={managerWrite ? 'campaign-pc' : 'user-pc'}
          writeCampaignCharacterMedia={managerWrite}
        />
      }
      showDelete={detail.campaignCharacter.capabilities.canDelete}
      statusSummary={
        <CampaignCharacterStatusSummary
          vital={character.vital}
          roster={detail.campaignCharacter.participation.roster}
        />
      }
      statusActions={
        canManage ? (
          <CampaignParticipatingCharacterStatusEditAction
            vital={character.vital}
            roster={detail.campaignCharacter.participation.roster}
            description="Update roster and vital status for this character."
            errorMessage="Could not update character status."
            isPending={updateStatus.isPending}
            error={updateStatus.error}
            onSave={async (values) => {
              await updateStatus.mutateAsync(toCampaignParticipatingCharacterStatusPatch(values))
            }}
          />
        ) : undefined
      }
      identitySupplement={
        <CharacterIdentityConnectionsSupplement
          campaignId={campaignId}
          characterId={characterId}
          characterName={detail.viewModel.identity.name}
          canEdit={detail.campaignCharacter.capabilities.canEdit}
          subjectKind="pc"
        />
      }
    />
  )
}
