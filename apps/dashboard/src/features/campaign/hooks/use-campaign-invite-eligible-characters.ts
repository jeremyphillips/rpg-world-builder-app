import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  completeCampaignInviteWithExistingCharacter,
  fetchEligibleCharactersForInvite,
} from '../api/campaign-invite-client'
import { campaignInviteOnboardingContextQueryKey } from './use-campaign-invite-onboarding-context'

export const campaignInviteEligibleCharactersQueryKey = (inviteId: string) =>
  ['campaign-invite', 'eligible-characters', inviteId] as const

export function useCampaignInviteEligibleCharacters(inviteId: string | undefined) {
  return useQuery({
    queryKey: campaignInviteEligibleCharactersQueryKey(inviteId ?? ''),
    queryFn: () => fetchEligibleCharactersForInvite(inviteId!),
    enabled: Boolean(inviteId),
  })
}

export function useCompleteCampaignInviteWithExistingCharacter(inviteId: string | undefined) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (characterId: string) =>
      completeCampaignInviteWithExistingCharacter({
        inviteId: inviteId!,
        characterId,
      }),
    onSuccess: async () => {
      if (!inviteId) return
      await queryClient.invalidateQueries({
        queryKey: campaignInviteOnboardingContextQueryKey(inviteId),
      })
    },
  })
}
