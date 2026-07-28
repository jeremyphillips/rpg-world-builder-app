import { useMutation, useQueryClient } from '@tanstack/react-query'

import type { CreateCharacterInput } from '@rpg/contracts'

import { completeCampaignInviteWithNewCharacter } from '../api/campaign-invite-client'
import { campaignsQueryKey } from './use-campaigns'
import { campaignMembersQueryKey } from './use-campaign-members'
import { campaignPartyQueryKey } from './use-campaign-party'

export function useCompleteCampaignInviteWithNewCharacter(inviteId: string | undefined) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (characterCreateInput: CreateCharacterInput) =>
      completeCampaignInviteWithNewCharacter({
        inviteId: inviteId!,
        characterCreateInput,
      }),
    onSuccess: async (result) => {
      if (!inviteId) return
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: campaignMembersQueryKey(result.campaignId) }),
        queryClient.invalidateQueries({ queryKey: campaignPartyQueryKey(result.campaignId) }),
        queryClient.invalidateQueries({ queryKey: campaignsQueryKey }),
      ])
    },
  })
}
