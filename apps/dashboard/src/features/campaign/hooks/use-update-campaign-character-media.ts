import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { CampaignCharacterGetResponse, CharacterMediaPatchInput } from '@rpg/contracts'

import { patchCampaignCharacterMedia } from '../api/campaign-character-client'
import { campaignCharacterQueryKey } from './use-campaign-character'

export function useUpdateCampaignCharacterMedia(
  campaignId: string | undefined,
  characterId: string | undefined,
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (patch: CharacterMediaPatchInput) =>
      patchCampaignCharacterMedia(campaignId!, characterId!, patch),
    onSuccess: (response: CampaignCharacterGetResponse) => {
      if (campaignId && characterId) {
        queryClient.setQueryData(campaignCharacterQueryKey(campaignId, characterId), response)
      }
    },
  })
}
