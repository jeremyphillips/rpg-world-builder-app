import { useMutation, useQueryClient } from '@tanstack/react-query'
import type {
  CampaignCharacterGetResponse,
  CampaignParticipatingCharacterStatusPatch,
} from '@rpg/contracts'

import { patchCampaignCharacterStatus } from '../api/campaign-character-client'
import { campaignCharacterQueryKey } from './use-campaign-character'

export function useUpdateCampaignCharacterStatus(
  campaignId: string | undefined,
  characterId: string | undefined,
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (patch: CampaignParticipatingCharacterStatusPatch) =>
      patchCampaignCharacterStatus(campaignId!, characterId!, patch),
    onSuccess: (response: CampaignCharacterGetResponse) => {
      if (campaignId && characterId) {
        queryClient.setQueryData(campaignCharacterQueryKey(campaignId, characterId), response)
      }
    },
  })
}
